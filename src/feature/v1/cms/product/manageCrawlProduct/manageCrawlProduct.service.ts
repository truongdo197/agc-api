import { handleAsinCode, handleJanCodeSaiyasune, handleJanCode } from '$config/jobs/method';
import { ProductFactoryStatus, SourceProduct, UrlProductFactoryStatus } from '$enum/common';
import ProductFactory from '$schema/ProductFactory';
import { PagingParams } from '$types/interface/Pagination.definition';
import { makeKeywordConditions, returnPaging } from '$utils/utils';
import moment from 'moment';
import { getObjectId } from '$utils/utils';
import Product from '$schema/Product';
import CodeMap from '$schema/CodeMap';
import { ErrorCode } from '$enum/common';
import { compact, sortBy, map } from 'lodash';
import SubProduct from '$schema/SubProduct';
import log from '$config/log';
import CrawlLog from '$schema/CrawlLog';
const JAN_REGEX = /^(\d{13})?$/;
const ASIN_REGEX = /([A-Z0-9]{10})/;
interface IProductFactory {
	title: string;
	asinCode: string;
	janCode: string;
}
export async function addProductFactory(body: IProductFactory) {
	const { janCode, asinCode, title } = body;
	if (!asinCode && !janCode) {
		throw ErrorCode.Missing_ASIN_Or_JAN;
	}
	if (asinCode && !ASIN_REGEX.test(asinCode)) {
		throw ErrorCode.ASIN_Not_Validate;
	}
	if (janCode && !JAN_REGEX.test(janCode)) {
		throw ErrorCode.JAN_CODE_Not_Validate;
	}
	const orConditions = [];
	if (!!janCode) {
		orConditions.push({ janCode });
	}
	if (!!asinCode) {
		orConditions.push({ asinCode });
	}
	const productFactoryDuplicate = await ProductFactory.findOne({
		$or: orConditions,
	});
	if (productFactoryDuplicate) {
		productFactoryDuplicate.title = title;
		productFactoryDuplicate.janCode = janCode;
		productFactoryDuplicate.asinCode = asinCode;
		productFactoryDuplicate.history = [];
		productFactoryDuplicate.urlProducts = [];
		await Product.deleteMany({ 'codes.value': { $in: compact([janCode, asinCode]) } });
		await SubProduct.deleteMany({ 'code.value': { $in: compact([janCode, asinCode]) } });
		const [handleAsin, handleJan, productFactorySaved] = await Promise.all([
			asinCode ? handleAsinCode(asinCode) : null,
			janCode ? handleJanCode(janCode) : null,
			productFactoryDuplicate.save(),
		]);
		return productFactorySaved;
	}

	const productFactory = new ProductFactory({ ...body });
	const [handleAsin, handleJan, productFactorySaved] = await Promise.all([
		handleAsinCode(asinCode),
		handleJanCode(janCode),
		productFactory.save(),
	]);

	return productFactorySaved;
}

interface IProducFactoryPaging extends PagingParams {
	keyword?: string;
}
export async function getListProductFactory(params: IProducFactoryPaging) {
	const conditions = {};

	if (params.keyword) {
		conditions['$or'] = [
			{ title: makeKeywordConditions(params.keyword) },
			{ asinCode: params.keyword },
			{ janCode: params.keyword },
		];
	}
	const data = await ProductFactory.aggregate([
		{
			$sort: {
				updatedAt: -1,
			},
		},
		{
			$match: conditions,
		},

		{
			$skip: params.start,
		},
		{
			$limit: params.pageSize,
		},
	]).allowDiskUse(true);

	const totalItem = await ProductFactory.countDocuments(conditions);
	return returnPaging(data, totalItem, params);
}

export async function statisticalCrawlInday(params: any) {
	const currentDate = new Date(params.updatedAt);

	const crawlToday = await ProductFactory.aggregate([
		{ "$unwind": "$history" },
		{ "$match": { "history.createdAt": { $gte: currentDate } } },
		{
			"$group": {
				"_id": "$_id",
				"total": { "$sum": 1 }
			}
		}
	]).allowDiskUse(true);

	const failCrawlToday = await CrawlLog.find({
		createdAt: { $gte: currentDate }
	}).count();

	let total = 0;
	crawlToday.forEach((item) => {
		total += item.total;
	});

	return {
		success: total - failCrawlToday,
		total: total
	};
}

export async function addUrlToProductFactory(urlProduct: string, code: string, source: string) {
	const productFactory = await ProductFactory.findOne({
		$or: [{ janCode: code }, { asinCode: code }],
	});
	if (!productFactory) return;
	const product = await Product.findOne({
		'codes.value': { $in: compact([productFactory.janCode, productFactory.asinCode]) },
	});
	if (product && productFactory) {
		product.title = productFactory.title;
		await product.save();
	}

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

export async function getHistoryByDetail(productFactoryId: string) {
	const productFactory = await ProductFactory.findOne({ _id: getObjectId(productFactoryId) }).sort(
		'-createdAt'
	);
	return sortBy(productFactory.history, (item) => -item.createdAt);
}

export async function handleAmazonError(subProduct) {
	if (!subProduct.sku) return;
	return await ProductFactory.updateMany(
		{
			asinCode: subProduct.sku,
		},
		{
			$push: {
				urlProducts: {
					url: subProduct.urlProduct,
					source: subProduct.source,
					status: UrlProductFactoryStatus.FAILED,
				},
				history: {
					createdAt: moment().toDate(),
					urlProduct: subProduct.urlProduct,
					status: ProductFactoryStatus.FAILED,
				},
			},
		}
	);
}

export async function handleNormalSubProdError(subProduct) {
	return await ProductFactory.updateOne(
		{
			janCode: subProduct.code.value,
		},
		{
			$push: {
				urlProducts: {
					url: subProduct.urlProduct,
					source: subProduct.source,
					status: UrlProductFactoryStatus.FAILED,
				},
				history: {
					createdAt: moment().toDate(),
					urlProduct: subProduct.urlProduct,
					status: ProductFactoryStatus.FAILED,
				},
			},
		}
	);
}

export async function updateProductFactory(productFactoryId: string, body) {
	const { title, janCode, asinCode } = body;

	const oldProductFactory = await ProductFactory.findOne({ _id: getObjectId(productFactoryId) });

	if (oldProductFactory?.janCode !== janCode || oldProductFactory?.asinCode !== asinCode) {
		await Product.deleteMany({
			'codes.value': { $in: compact([oldProductFactory.janCode, oldProductFactory.asinCode]) },
		});
		await SubProduct.deleteMany({
			'code.value': { $in: compact([oldProductFactory.janCode, oldProductFactory.asinCode]) },
		});
		await Promise.all([
			asinCode ? handleAsinCode(asinCode) : null,
			janCode ? handleJanCode(janCode) : null,
		]);
	}
	const productFactory = await ProductFactory.updateOne(
		{ _id: getObjectId(productFactoryId) },
		{ ...body, history: [], urlProducts: [] }
	);
	productFactory.title = title;
	productFactory.janCode = janCode;
	productFactory.asinCode = asinCode;

	return productFactory;
}
