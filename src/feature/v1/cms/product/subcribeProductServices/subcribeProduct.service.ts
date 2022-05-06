import { CodeType, ProductFactoryStatus, UrlProductFactoryStatus } from '$types/enum/common';
import SubProduct from '$schema/SubProduct';
import {
	get,
	head,
	assignIn,
	pick,
	omit,
	filter,
	assign,
	compact,
	pickBy,
	map,
	minBy,
} from 'lodash';
import Product from '$schema/Product';
import CodeMap from '$schema/CodeMap';
import env from '$config/env';
import log from '$config/log';
import { getAsinCodeFromUrl, getObjectId } from '$utils/utils';
import { SourceProduct, QueueName, JobName } from '$enum/common';
import { ISubProduct, IProduct } from '$types/interface/Product.definition';
import connRedis from '$config/redis';
import moment from 'moment';
import { createCodeMap } from '../product.model';
import { getSource } from '$utils/utils';
import {
	handleAmazonError,
	handleNormalSubProdError,
} from '../manageCrawlProduct/manageCrawlProduct.service';
import ProductFactory from '$schema/ProductFactory';
import { addAffiliateUrlForSubProduct, handleAffiliateUrl } from '$config/jobs/method';
import { addJobs } from '$config/jobs/jobAction';
import { productQueue } from '$config/jobs/Queue';
const jsonFix = require('dirty-json');

export const processMessage = async (rawSubprodString: string) => {
	if (rawSubprodString) {
		const data = jsonFix.parse(rawSubprodString);
		const totalUrl = await connRedis.get('totalUrl');
		const increaseTotalUrl = totalUrl ? Number(totalUrl) + 1 : 0;
		await connRedis.set('totalUrl', increaseTotalUrl);
		try {
			await preprocessSubProduct(data);
			await addAffiliateUrlForSubProduct(data.urlProduct);
			return;
		} catch (error) {
			connRedis.rpush(
				'failureUrls',
				JSON.stringify({
					url: data.urlProduct,
					msg: `URL: ${data.urlProduct} :${error.message}`,
					createdAt: moment().toDate(),
				})
			);

			if (data.source !== SourceProduct.AMAZON) {
				await handleNormalSubProdError(data);
			} else {
				await handleAmazonError(data);
			}
			log('PubSub processMessage subcribeProduct').error(`URL: ${data.urlProduct} :${error.stack}`);
		}
	}
	return;
};

async function preprocessSubProduct(rawData) {
	log('PubSub preprocessSubProduct subcribeProduct').error('Data', rawData);
	// tiền xử lý dữ liệu ban đầu
	if (!get(rawData, 'price', false)) {
		throw Error('No price');
	}
	if (
		rawData.source !== SourceProduct.AMAZON &&
		(!get(rawData, 'code.value', false) || rawData.code.value === 'None')
	) {
		throw Error('No JAN code');
	}
	if (rawData.source === SourceProduct.AMAZON && !get(rawData, 'sku', false)) {
		throw Error('No ASIN code');
	}
	if (!get(rawData, 'title', false)) {
		throw Error('No title');
	}
	if (
		get(rawData, 'categories[0].name', []) === 'None' ||
		!rawData.categories ||
		!rawData.categories.length
	) {
		rawData.categories = [];
	}
	if (get(rawData, 'store', false) === 'None' || !get(rawData, 'store', false)) {
		throw Error('No store');
	}

	const code =
		rawData.source === SourceProduct.AMAZON
			? { value: rawData.sku, codeType: CodeType.ASIN }
			: { value: rawData.code.value, codeType: CodeType.JAN_CODE };
	const subProduct = new SubProduct({
		...omit(rawData, ['active']),
		hasFee: rawData.hasFee === 'False' ? false : true,
		code,
	});
	const productFactory = await ProductFactory.findOne({
		$or: [{ asinCode: subProduct.code.value }, { janCode: subProduct.code.value }],
	})
		.select('-urlProducts -history')
		.lean();
	if (!productFactory) {
		throw Error('Not Exist Product Factory Imported');
	}

	//Nếu đã có sub product rồi thì chỉ dừng ở việc update vì nếu không tồn tại trước đó thì đã xử lý nhánh khác
	// subProductExisted là 1 object hoặc null, isProductExisted trả true false
	const subProductExisted = await checkOldSubProductExisted(subProduct.urlProduct);
	const isProductExisted = subProductExisted
		? await checkIsProductExisted(subProductExisted)
		: false;

	// log('PubSub isSubProductExisted && isProductExisted').error(`: ${subProductExisted} : ${isProductExisted}`);

	// đảm bảo có cả sub product và product thì mới update
	if (subProductExisted && isProductExisted) {
		return await updateOldSubProduct(subProduct.urlProduct, subProduct);
	}

	// chưa có sub product thì tạo mới
	if (!subProductExisted) {
		await subProduct.save();
	}
	return await processSubProduct(subProduct);
}

async function checkIsProductExisted(subProductExisted: any) {
	const product = await Product.findOne({ _id: subProductExisted.productId });
	return product;
}

async function checkOldSubProductExisted(urlProduct: string) {
	const oldSubProduct = await SubProduct.findOne({ urlProduct });
	return oldSubProduct;
}

async function updateOldSubProduct(urlProduct: string, subProduct: ISubProduct) {
	const oldSubProduct = await SubProduct.findOne({ urlProduct });
	const attr = [
		'price',
		'title',
		'shortDescriptions',
		'longDescriptions',
		'store',
		'feeText',
		'price',
		'hasFee',
		'categories',
	];
	if (!oldSubProduct.reviews || oldSubProduct.reviews.length <= 0) attr.push('reviews');
	assignIn(oldSubProduct, pick(subProduct, attr));

	oldSubProduct.code = {
		value: subProduct.code.value,
		codeType: subProduct.source === SourceProduct.AMAZON ? CodeType.ASIN : CodeType.JAN_CODE,
	};

	const product = await Product.findOne({ _id: oldSubProduct.productId });
	product.price = oldSubProduct.price <= product.price ? oldSubProduct.price : product.price;
	product.sourceMinPrice =
		oldSubProduct.price <= product.price ? oldSubProduct.source : product.sourceMinPrice;

	await getCountCommentReview(product);

	return await Promise.all([
		SubProduct.updateOne({ _id: getObjectId(oldSubProduct) }, oldSubProduct),
		addUrlToProductFactory(subProduct.urlProduct, subProduct.code.value, subProduct.source),
	]);
}

async function processSubProduct(subProduct: ISubProduct) {
	const productFactory = await ProductFactory.findOne({
		$or: [{ asinCode: subProduct.code.value }, { janCode: subProduct.code.value }],
	})
		.select('-urlProducts -history')
		.lean();
	const allCodesOfProductFactory = compact([productFactory.asinCode, productFactory.janCode]);
	const product = await Product.findOne({ 'codes.value': { $in: allCodesOfProductFactory } });

	const newCodes = map(allCodesOfProductFactory, (code) => {
		return {
			value: code,
			codeType: productFactory.asinCode === code ? CodeType.ASIN : CodeType.JAN_CODE,
		};
	});

	//Đã có product được tạo từ trước đó bằng productFactory
	if (!product) {
		return await createNewProduct(productFactory, newCodes, subProduct);
	}
	return await processProductExisted(product, newCodes, subProduct);
}

async function processProductExisted(
	productExisted: IProduct,
	newCodes: Array<{ value: string; codeType: string }>,
	subProduct: ISubProduct
) {
	const subProducts = await SubProduct.find({ 'code.value': { $in: map(newCodes, 'value') } });
	const cheapestSubProduct: any = minBy(subProducts, (subProduct) => subProduct.price);

	const product = await Product.findOne({ _id: getObjectId(productExisted._id) });
	product.codes = newCodes;
	product.price = cheapestSubProduct.price;
	product.sourceMinPrice = cheapestSubProduct.source;

	if (!product.longDescriptions.length) {
		product.longDescriptions = subProduct.longDescriptions;
	}
	if (!product.shortDescriptions.length) {
		product.shortDescriptions = subProduct.shortDescriptions;
	}

	await getCountCommentReview(product);

	return await Promise.all([
		SubProduct.updateMany({ _id: { $in: map(subProducts, '_id') } }, { productId: product._id }),
		addUrlToProductFactory(subProduct.urlProduct, subProduct.code.value, subProduct.source),
	]);
}

interface IProductFactory {
	title: string;
	asinCode: string;
	janCode: string;
	urlProducts: Array<{ source: string; url: string; status: number }>;
	history: Array<{
		createdAt: Date | string;
		urlProduct: string;
		status: number;
	}>;
}

async function createNewProduct(
	productFactory: IProductFactory,
	productFactoryCodes: Array<{ value: string; codeType: string }>,
	subProduct: ISubProduct
) {
	const product = {
		title: productFactory.title,
		longDescriptions: get(subProduct, 'longDescriptions', []),
		shortDescriptions: get(subProduct, 'shortDescriptions', []),
		thumbnail: head(subProduct?.images) || env.noImageLink,
		images: subProduct?.images,
		codes: productFactoryCodes,
		price: get(subProduct, 'price', 0),
		sourceMinPrice: subProduct.source,
		views: 0,
		reviews: subProduct?.reviewsSummary?.avg,
		comment: subProduct?.reviewsSummary?.total,
		active: true,
	};
	const valueCode = compact(map(product.codes, 'value'));

	await Product.updateOne({ 'codes.value': { $in: valueCode } }, product, {
		upsert: true,
	});
	const productUpdate = await Product.findOne({ 'codes.value': { $in: valueCode } });
	const newSubProduct = new SubProduct(subProduct);
	newSubProduct.productId = productUpdate._id;
	newSubProduct.isProcessedAsinCode = true;
	return await Promise.all([
		newSubProduct.save(),
		addUrlToProductFactory(subProduct.urlProduct, subProduct.code.value, subProduct.source),
	]);
}

// truong hop success cua sub product
async function addUrlToProductFactory(urlProduct: string, code: string, source: string) {
	await ProductFactory.updateMany(
		{
			$or: [{ janCode: code }, { asinCode: code }],
		},
		{
			$push: {
				urlProducts: { url: urlProduct, source, status: UrlProductFactoryStatus.SUCCESS },
				history: { createdAt: moment().toDate(), urlProduct, status: ProductFactoryStatus.SUCCESS },
			},
		}
	);
	return;
}

async function getCountCommentReview(product: any) {
	let comments = 0;
	let reviews = 0;
	let sum = 0;
	const subProducts = await SubProduct.find({ productId: getObjectId(product) });

	subProducts.map((item: any) => {
		if (!!item.reviewsSummary.avg && item.reviewsSummary.avg > 0) {
			reviews += item.reviewsSummary.avg;
			sum += 1;
			comments += item.reviewsSummary.total;
		}
	});
	if (reviews > 0) reviews = reviews / sum;
	product.comments = comments;
	product.reviews = Number(reviews.toFixed(2));
	return await Product.updateOne(
		{ _id: getObjectId(product) },
		{ comments: comments, reviews: reviews }
	);
}
//------------------------------------------------------------------------------------------------//
//For Schedule
//------------------------------------------------------------------------------------------------//

export async function scheduleSyncProductFactory(productFactory: IProductFactory) {
	const allCodesOfProductFactory = compact([productFactory.asinCode, productFactory.janCode]);
	const product = await Product.findOne({ 'codes.value': { $in: allCodesOfProductFactory } });
	const newCodes = map(allCodesOfProductFactory, (code) => {
		return {
			value: code,
			codeType: productFactory.asinCode === code ? CodeType.ASIN : CodeType.JAN_CODE,
		};
	});
	if (product) {
		return await processFactoryWhenProductExisted(product, newCodes);
	}
	return await processFactoryWhenProductNotExisted(productFactory, newCodes);
}

async function processFactoryWhenProductExisted(
	product: IProduct,
	codes: Array<{ value: string; codeType: string }>
) {
	const subProducts = await SubProduct.find({ productId: product._id });
	const cheapestSubProduct: any = minBy(subProducts, (subProduct) => subProduct.price);

	await Product.updateOne(
		{ _id: getObjectId(product._id) },
		{ codes, price: cheapestSubProduct.price, sourceMinPrice: cheapestSubProduct.source }
	);

	await SubProduct.updateMany(
		{ _id: { $in: map(subProducts, '_id') } },
		{ productId: product._id }
	);
	return;
}

async function processFactoryWhenProductNotExisted(
	productFactory: IProductFactory,
	codes: Array<{ value: string; codeType: string }>
) {
	const subProductsNotLinked = await SubProduct.find({
		'code.value': { $in: map(codes, 'value') },
		$or: [{ productId: { $eq: null } }, { productId: { $exists: false } }],
	});
	const cheapestSubProduct: any = minBy(subProductsNotLinked, (subProduct) => subProduct.price);
	if (!subProductsNotLinked.length) {
		return;
	}
	const product = new Product({
		title: productFactory.title,
		longDescriptions: get(subProductsNotLinked[0], 'longDescriptions', []),
		shortDescriptions: get(subProductsNotLinked[0], 'shortDescriptions', []),
		thumbnail: head(subProductsNotLinked[0]?.images) || env.noImageLink,
		images: subProductsNotLinked[0]?.images,
		codes: codes,
		price: get(cheapestSubProduct, 'price', 0),
		sourceMinPrice: cheapestSubProduct.source,
	});

	return await Promise.all([
		product.save(),
		SubProduct.updateMany(
			{ _id: { $in: map(subProductsNotLinked, '_id') } },
			{ productId: product._id }
		),
	]);
}

export async function createJobSyncProductFactory() {
	const productFactories = await ProductFactory.find().select('-urlProducts -history').lean();
	productFactories.forEach((productFactory) => {
		addJobs(productQueue, JobName.SYNC_PRODUCT_FACTORY, productFactory);
	});
}
