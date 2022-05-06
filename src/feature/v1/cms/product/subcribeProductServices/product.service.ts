import { CodeType, ProductFactoryStatus, UrlProductFactoryStatus } from '$types/enum/common';
import SubProduct from '$schema/SubProduct';
import { get, head, assignIn, pick, omit, filter, assign } from 'lodash';
import Product from '$schema/Product';
import CodeMap from '$schema/CodeMap';
import env from '$config/env';
import log from '$config/log';
import { getAsinCodeFromUrl, getObjectId } from '$utils/utils';
import { SourceProduct } from '$enum/common';
import { ISubProduct } from '$types/interface/Product.definition';
import connRedis from '$config/redis';
import moment from 'moment';
import { createCodeMap } from '../product.model';
import { getSource } from '$utils/utils';
import {
	addUrlToProductFactory,
	handleAmazonError,
	handleNormalSubProdError,
} from '../manageCrawlProduct/manageCrawlProduct.service';
import ProductFactory from '$schema/ProductFactory';
import { addAffiliateUrlForSubProduct, handleAffiliateUrl } from '$config/jobs/method';
const jsonFix = require('dirty-json');
export const processMessage = async (rawSubprodString: string) => {
	const data = jsonFix.parse(rawSubprodString);
	const totalUrl = await connRedis.get('totalUrl');
	const increaseTotalUrl = totalUrl ? Number(totalUrl) + 1 : 0;
	await connRedis.set('totalUrl', increaseTotalUrl);
	try {
		log('PubSub processMessage product').info(`URL: ${data.urlProduct} is being processed`);

		if (data.source === SourceProduct.AMAZON) {
			await processAmazonVer2(data);
		} else {
			await processNormalProduct(data);
		}
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
		log('PubSub processMessage product').error(`URL: ${data.urlProduct} :${error.message}`);
		log('PubSub processMessage product').error(`URL: ${data.urlProduct} :${error}`);
	}
};

export const processNormalProduct = async (rawData) => {
	const subProduct = rawData;
	if (!get(subProduct, 'price', false)) {
		throw Error('No price');
	}
	if (!get(subProduct, 'code.value', false) || subProduct.code.value === 'None') {
		throw Error('No code');
	}
	if (!get(subProduct, 'title', false)) {
		throw Error('No title');
	}
	if (get(subProduct, 'categories[0].name', []) === 'None' || !subProduct.categories.length) {
		throw Error('No categories');
	}
	if (get(subProduct, 'store', false) === 'None' || !get(subProduct, 'store', false)) {
		throw Error('No store');
	}
	await addUrlToProductFactory(subProduct.urlProduct, subProduct.code?.value, subProduct.source);
	const code = { value: subProduct.code.value, codeType: CodeType.JAN_CODE };
	const subProductExist = await SubProduct.findOne({
		urlProduct: subProduct.urlProduct,
	});
	const productFactory = await ProductFactory.findOne({
		$or: [{ asinCode: subProduct.code.value, janCode: subProduct.code.value }],
	});
	const productName = productFactory?.title;
	if (subProductExist) {
		//update subProduct cũ
		assignIn(
			subProductExist,
			pick(subProduct, ['price', 'title', 'shortDescriptions', 'longDescriptions', 'store'])
		);
		subProductExist.code = { value: subProduct.sku, codeType: CodeType.ASIN };
		subProductExist.price = subProduct.price;
		subProductExist.hasFee = get(subProduct, 'hasFee', true) === 'False' ? false : true;
		subProductExist.categories = subProduct.categories;
		if (subProductExist.productId) {
			const updateValue = { price: subProduct.price, sourceMinPrice: subProduct.source };
			if (productName) {
				updateValue['title'] = productName;
			}
			await Product.updateOne(
				{ _id: subProductExist.productId, price: { $gte: subProduct.price }, active: true },
				updateValue
			);
			await subProductExist.save();
			await addUrlToProductFactory(subProduct.urlProduct, subProduct.sku, subProduct.source);
			return;
		} else {
			const productShouldLinked = await Product.findOne({ 'codes.value': code.value });
			if (productShouldLinked) {
				subProductExist.productId = productShouldLinked._id;
				productShouldLinked.price =
					productShouldLinked.price && productShouldLinked.price > subProductExist.price
						? subProductExist.price
						: productShouldLinked.price;

				productShouldLinked.sourceMinPrice =
					productShouldLinked.price && productShouldLinked.price > subProductExist.price
						? subProductExist.source
						: productShouldLinked.sourceMinPrice;
				if (productName) {
					productShouldLinked.title = productName;
				}
				subProductExist.productId = getObjectId(productShouldLinked);
				await productShouldLinked.save();
				await subProductExist.save();
				await addUrlToProductFactory(subProduct.urlProduct, subProduct.sku, subProduct.source);
				return;
			}
		}
	} else {
		//không có subProduct
		const newSubProd = new SubProduct({
			...omit(subProduct, ['active']),
			hasFee: subProduct.hasFee === 'False' ? false : true,
			code,
		});
		let productExist = await Product.findOne({
			'codes.value': code.value,
			active: true,
		});
		if (!productExist) {
			productExist = new Product({
				title: productName ? productName : get(subProduct, 'title', '製品の名前がない'),
				longDescriptions: get(subProduct, 'longDescriptions', []),
				shortDescriptions: get(subProduct, 'shortDescriptions', []),
				thumbnail: head(subProduct?.images) || env.noImageLink,
				images: subProduct?.images,
				codes: [code],
				price: get(subProduct, 'price', 0),
				sourceMinPrice: subProduct.source,
			});
			newSubProd.productId = getObjectId(productExist);
			await productExist.save();
			await newSubProd.save();
			await addUrlToProductFactory(subProduct.urlProduct, subProduct.sku, subProduct.source);
			return;
		} else {
			productExist.price =
				productExist.price && productExist.price > newSubProd.price
					? newSubProd.price
					: productExist.price;

			productExist.sourceMinPrice =
				productExist.price && productExist.price > newSubProd.price
					? newSubProd.source
					: productExist.sourceMinPrice;
			if (productName) {
				productExist.title = productName;
			}
			newSubProd.productId = getObjectId(productExist);
			await productExist.save();
			await newSubProd.save();
			await addUrlToProductFactory(subProduct.urlProduct, subProduct.sku, subProduct.source);
			return;
		}
	}
};

export const processAmazonVer2 = async (rawData) => {
	const subProduct: ISubProduct = rawData;
	if (!subProduct.price) {
		throw Error('No price');
	}
	if (!subProduct.sku || subProduct.sku === 'None') {
		throw Error('No code');
	}
	if (!subProduct.title) {
		throw Error('No title');
	}
	if (
		get(subProduct, 'categories[0].name', []) === 'None' ||
		!get(subProduct, 'categories[0].name', []).length
	) {
		throw Error('No categories');
	}
	if (get(subProduct, 'store', false) === 'None' || !get(subProduct, 'store', false)) {
		throw Error('No store');
	}
	const code = { value: subProduct.sku, codeType: CodeType.ASIN };
	const isCodeMapExisted = await CodeMap.findOne({ asin: subProduct.sku });
	const subProdExist = await SubProduct.findOne({
		urlProduct: subProduct.urlProduct,
	});
	const productFactory = await ProductFactory.findOne({
		asinCode: subProduct.sku,
	});
	const productName = productFactory?.title;
	if (subProdExist) {
		assignIn(
			subProdExist,
			pick(subProduct, ['price', 'title', 'shortDescriptions', 'longDescriptions'])
		);
		subProdExist.code = { value: subProduct.sku, codeType: CodeType.ASIN };
		subProdExist.price = subProduct.price;
		subProdExist.hasFee = get(subProduct, 'hasFee', true);
		subProdExist.store = subProduct.store;
		subProdExist.isProcessedAsinCode = isCodeMapExisted ? true : false;
		if (subProdExist.productId) {
			const updateValue = { price: subProduct.price, sourceMinPrice: subProduct.source };
			if (productName) {
				updateValue['title'] = productName;
			}
			await Product.updateOne(
				{ _id: subProdExist.productId, price: { $gte: subProduct.price }, active: true },
				updateValue
			);
		}
		await subProdExist.save();
		await addUrlToProductFactory(subProduct.urlProduct, subProduct.sku, subProduct.source);
		return;
	} else {
		await new SubProduct({
			...omit(subProduct, ['active']),
			price: subProduct.price,
			code,
			isProcessedAsinCode: isCodeMapExisted ? true : false,
		}).save();
		await addUrlToProductFactory(subProduct.urlProduct, subProduct.sku, subProduct.source);
		return;
	}
};

interface IBodyCodeMap {
	jancode: string;
	asin: string;
}
export async function processCodeMap(rawData: string) {
	const body: IBodyCodeMap = jsonFix.parse(rawData);
	try {
		const codeMap = { ean: body.jancode, asin: body.asin, _id: body.asin };
		const subProduct = await SubProduct.findOne({ sku: body.asin });
		if (subProduct) {
			subProduct.isProcessedAsinCode = true;
			await subProduct.save();
		}
		await createCodeMap(codeMap);
	} catch (error) {
		log('PubSub').error(`CodeMap: ${body.asin} :${error.message}`);
	}
}
interface IRawSubProd {
	jancode: string;
	url: string;
	store: string;
	price: number;
	point: string;
	realPrice: number;
	freeShip: string;
	itemCode: string;
}
export async function processSubproductSaiyasune(rawData: string) {
	const body: IRawSubProd = jsonFix.parse(rawData);
	try {
		log('PubSub processSubproductSaiyasune').info(
			`store: ${body.store}, price: ${body.price}, link ${body.url}`
		);
		if (!body.price) {
			throw Error('No price');
		}
		const point = body.point.match(/\d+((.|,)\d+)?/) ? body.point.match(/\d+((.|,)\d+)?/)[0] : 0;
		const code =
			getSource(body.url) === SourceProduct.AMAZON
				? { value: getAsinCodeFromUrl(body.url), codeType: CodeType.ASIN }
				: { value: body.jancode, codeType: CodeType.JAN_CODE };
		let subProduct = {
			code,
			store: body.store,
			urlProduct: body.url.split('?')[0],
			price: body.price,
			hasFee: body.freeShip === '無料' ? false : true,
			source: getSource(body.url),
			discount: Math.ceil((Number(point) / body.price) * 100),
			isProcessedAsinCode: getSource(body.url) === SourceProduct.AMAZON ? true : false,
		};
		if (getSource(body.url) === SourceProduct.AMAZON) {
			subProduct['sku'] = getAsinCodeFromUrl(body.url);
		}
		let subProdExisted = await SubProduct.findOne({ urlProduct: body.url.split('?')[0] });
		if (!subProdExisted) {
			await addUrlToProductFactory(
				body.url.split('?')[0],
				subProduct.code.value,
				subProduct.source
			);
			return await new SubProduct(subProduct).save();
		}
		assignIn(subProdExisted, subProduct);
		await subProdExisted.save();
		await addUrlToProductFactory(body.url.split('?')[0], subProduct.code.value, subProduct.source);
	} catch (error) {
		connRedis.rpush(
			'failureUrls',
			JSON.stringify({
				url: body.url,
				msg: `URL: ${body.url} :${error.message}`,
				createdAt: moment().toDate(),
			})
		);
		await ProductFactory.updateMany(
			{
				janCode: body.jancode,
			},
			{
				$push: {
					urlProducts: {
						url: body.url,
						source: getSource(body.url),
						status: UrlProductFactoryStatus.FAILED,
					},
					history: {
						createdAt: moment().toDate(),
						urlProduct: body.url,
						status: ProductFactoryStatus.FAILED,
					},
				},
			}
		);
		log('PubSub processSubproductSaiyasune').error(`URL: ${body.url} :${error.message}`);
		log('PubSub processSubproductSaiyasune').error(`URL: ${body.url} :${error}`);
	}
}
