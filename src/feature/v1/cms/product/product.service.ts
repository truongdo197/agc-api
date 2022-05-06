import { IListProduct, IAddProduct, IUpdateProduct } from './product.interface';
import * as model from './product.model';
import * as modelES from './product.elasticsearch';

import { map, get, concat, uniqBy, ceil, indexOf, compact } from 'lodash';
import { getObjectId } from '$utils/utils';
import Product from '$schema/Product';
import SubProduct from '$schema/SubProduct';
import { IProduct, ISubProduct } from '$types/interface/Product.definition';
import { ParamsReturnPaging } from '$types/interface/Pagination.definition';
import _ from 'lodash';
import Bluebird, { filter, join } from 'bluebird';
import { ErrorCode, CodeType, SourceProduct, RecrawlType } from '$enum/common';
import env from '$config/env';
import { addJobs } from '$config/jobs/jobAction';
import connRedisUrl from '$config/redisAddUrl';
import { productQueue, asinCodeQueue } from '$config/jobs/Queue';
import { JobName } from '$types/enum/common';
import axios from 'axios';
import CodeMap from '$schema/CodeMap';
import log from '$config/log';
import SiteCategory from '$schema/SiteCategory';
import Metric from '$schema/Metric';
import { addUrlToProductFactory } from './manageCrawlProduct/manageCrawlProduct.service';
import ProductFactory from '$schema/ProductFactory';
import {
	deleteKeyRedis,
	handleAsinCode,
	handleJanCode,
	pushDataToCrawlerRedis,
} from '$config/jobs/method';
import { RedisCrawlerQueue } from '$enum/common';
import { generateTokenCms } from '../auth/auth.service';
import User from '$schema/User';
import config from '$config/env';
import moment from 'moment';

export async function getListProduct(params: IListProduct) {
	return await model.getListProduct(params);
}
export async function createProduct(params: IAddProduct) {
	//WARNING product
	try {
		const result = await model.createProduct(params.product);
		const subProductsWithProductId = map(params.newSubProducts, (subProduct) => {
			return { ...subProduct, productId: getObjectId(result) };
		});
		await Promise.all([
			model.insertManySubProduct(subProductsWithProductId),
			model.updateProductIdForSubProduct(map(params.subProducts, getObjectId), getObjectId(result)),
		]);

		return result;
	} catch (error) {
		await Promise.all([
			Product.deleteOne({ title: params.product.title }),
			SubProduct.updateMany(
				{ _id: { $in: map(params.subProducts, getObjectId) } },
				{ productId: null }
			),
			SubProduct.deleteMany({
				title: { $in: map(params.newSubProducts, (subProduct) => subProduct.title) },
				sku: { $in: map(params.newSubProducts, (subProduct) => subProduct.sku) },
			}),
		]);
		throw Error(error);
	}
}

export async function updateProduct(productId: string, body) {
	const product = await Product.findById(getObjectId(productId));
	if (!product) throw ErrorCode.Not_Found;
	_.assignIn(product, body.product);
	await product.save();

	if (body.subProducts) {
		const oldSubProducts = await SubProduct.find({ productId: product._id }).select('_id');
		await SubProduct.updateMany(
			{ _id: { $in: _.map(oldSubProducts, (oldSubProduct) => oldSubProduct._id) } },
			{
				productId: null,
			}
		);
		await SubProduct.updateMany(
			{ _id: { $in: body.subProducts } },
			{
				productId: getObjectId(product),
			}
		);
	}

	if (body.newSubProducts) {
		const subProductsWithProductId = _.map(body.newSubProducts, (newSubProduct) => {
			return { ...newSubProduct, productId: getObjectId(productId) };
		});
		await model.insertManySubProduct(subProductsWithProductId);
	}

	if (!checkSubProductExists(product._id)) {
		await Product.updateOne({ _id: product._id }, { active: false });
	}
	return product;
}

export async function deleteProduct(id: string, userId: string) {
	return await model.deleteProduct(id, userId);
}

export async function getDetailProduct(productId: string) {
	return await model.getDetailProduct(productId);
}

export async function getListSubProduct(params: ParamsReturnPaging) {
	return await model.getListSubProduct(params);
}

export async function searchSubProduct(params: IListProduct) {
	if (params.keyword) {
		return await modelES.searchSubProduct(params);
	}
	return await modelES.getListSubProduct(params);
}

export async function updateSubProduct(subProductId: string, body: ISubProduct) {
	return await model.updateSubProduct(subProductId, body);
}

export async function createJobMappingProduct() {
	const condition = {
		productId: { $exists: false },
		'code.codeType': { $ne: CodeType.UNKNOW },
		source: { $ne: SourceProduct.AMAZON },
	};
	const subProductCounts = await SubProduct.countDocuments(condition);
	const pageLength = ceil(subProductCounts / 5000);
	for (let pageIndex = 0; pageIndex < pageLength; pageIndex++) {
		const subProducts = await SubProduct.find(condition)
			.limit(5000)
			.skip(5000 * pageIndex);
		let isLast = pageIndex + 1 === pageLength ? true : false;
		addJobs(productQueue, JobName.MAPPING_SUBPRODUCT_TO_PRODUCT, { subProducts, isLast });
	}
}

function getCatIndex(categoryUrl) {
	const splitUrl = _.split(categoryUrl, '/');
	const indexes = _.filter(
		_.map(splitUrl, (e) => Number(e)),
		(index) => !!index
	);
	return indexes;
}

export async function mappingSubProdToProd(subProduct: ISubProduct) {
	if (!subProduct?.code?.value) {
		return;
	}
	let subProductCats = map(_.get(subProduct, 'categories', []), (cat) => getCatIndex(cat.url));
	const flattenAndUniqCats = _.uniq(_.flatten(subProductCats));
	const siteCat = await SiteCategory.findOne({ index: { $in: flattenAndUniqCats } });
	const codeMap = await CodeMap.findOne({ ean: subProduct.code.value });
	let product;
	if (codeMap) {
		product = await Product.findOne({
			'codes.value': codeMap.asin,
		});
		if (!product) {
			return mappingSubProdToProd(subProduct);
		}
	} else {
		product = await Product.findOne({
			'codes.value': subProduct.code.value,
		});
	}
	if (!product) {
		const newProduct = new Product({
			//WARNING product
			title: subProduct?.title,
			longDescriptions: get(subProduct, 'longDescriptions', []),
			shortDescriptions: get(subProduct, 'shortDescriptions', []),
			thumbnail: _.head(subProduct?.images) || env.noImageLink,
			images: subProduct?.images,
			codes: [{ value: subProduct.code.value, codeType: subProduct.code.codeType }],
			tag: get(siteCat, 'tag', null),
			price: get(subProduct, 'price', 0),
			sourceMinPrice: get(subProduct, 'source', 'UNKNOW'),
		});

		await newProduct.save();
		await SubProduct.updateOne({ _id: subProduct._id }, { productId: newProduct._id });
		return newProduct;
	}

	if (!product.longDescriptions.length) {
		product.longDescriptions = subProduct.longDescriptions;
	}

	if (!product.shortDescriptions.length) {
		product.shortDescriptions = subProduct.shortDescriptions;
	}

	if (subProduct.price < product.price) {
		product.sourceMinPrice = get(subProduct, 'source', 'UNKNOW');
		product.price = subProduct.price;
	}

	product.tag = get(siteCat, 'tag', null);
	product.codes.push({ value: subProduct.code.value, codeType: CodeType.JAN_CODE });
	product.codes = uniqBy(product.codes, 'value');
	await SubProduct.updateOne({ _id: subProduct._id }, { productId: product._id });
	return await product.save();
}

export async function mappingSubProductManual() {
	return await createJobMappingProduct();
}

export async function getCodeMap(asinCode: string) {
	try {
		const res = await axios.get(
			`https://api.asinscope.com/products/lookup?asin=${asinCode}&domain=jp&key=${env.asinScopeKey}`
		);
		let codeMaps = get(res, 'data.items', []);
		return {
			maps: map(codeMaps, (map) => {
				return {
					_id: map.asin,
					asin: map.asin,
					ean: map.ean,
					upc: map.upc,
				};
			}),
			dailyTokensLeft: res.data.dailyTokensLeft || 0,
			bucketSize: res.data.bucketSize || 0,
		};
	} catch (error) {
		return { dailyTokensLeft: 0, bucketSize: 0 };
	}
}

export async function createJobGetAmazonProduct() {
	const metrics = await Metric.findOne().select('dailyTokensLeft bucketSize');
	if (metrics.dailyTokensLeft > 0 && metrics.bucketSize > 0) {
		const limit = metrics.dailyTokensLeft < 10 ? metrics.dailyTokensLeft : 10;
		const amazonSubProducts = await SubProduct.find({
			source: SourceProduct.AMAZON,
			isProcessedAsinCode: { $in: [false, null] },
		}).limit(limit);

		addJobs(asinCodeQueue, JobName.PROCESS_AMAZON_PRODUCT, { amazonSubProducts }, { attempts: 1 });
	}
}

export async function processAmazonProduct(subProds: ISubProduct[]) {
	const amazonSkus = subProds.map((subProd) => {
		return subProd.sku || '';
	});

	await Bluebird.each(amazonSkus, async (sku) => {
		const isExits = await CodeMap.findOne({ asin: sku });
		if (isExits) {
			await SubProduct.updateOne({ sku: sku }, { isProcessedAsinCode: true });
		}
		if (!isExits) {
			const codeMap = await getCodeMap(sku);
			await Metric.updateOne(
				{},
				{ dailyTokensLeft: codeMap.dailyTokensLeft, bucketSize: codeMap.bucketSize }
			);
			if (codeMap.maps) {
				await CodeMap.insertMany(codeMap.maps);
				await SubProduct.updateOne({ sku: sku }, { isProcessedAsinCode: true });
				log('CodeMap').info(`SKU: ${sku} processed!`);
			}
		}
	});
	return;
}

export async function recrawlSubProduct(recrawlType) {
	const productFactoryFindConditions = {
		$or: [{ asinCode: { $nin: [null, ''] } }, { janCode: { $nin: ['', null] } }],
	};
	const RECORD_LIMIT = 100;
	const productFactoryLength = await ProductFactory.countDocuments(productFactoryFindConditions);
	const totalPages = Math.ceil(productFactoryLength / RECORD_LIMIT);

	// Nếu nhấn nút recrawl thì xóa hết trong queue, còn schedule mà call thì không xóa queue mà đẩy thêm vào
	if (recrawlType === RecrawlType.MANUAL) {
		await deleteKeyRedis(connRedisUrl);
	}
	
	for (let i = 0; i < totalPages; i++) {
		const productFactories = await ProductFactory.find(productFactoryFindConditions)
			.skip(RECORD_LIMIT * i)
			.limit(RECORD_LIMIT);
		const asinCodes = compact(map(productFactories, 'asinCode'));
		const janCodes = compact(map(productFactories, 'janCode'));
		const codes = [...asinCodes, ...janCodes];
		const subProducts = await SubProduct.find({ 'code.value': { $in: codes } }).select(
			'urlProduct source code'
		);

		subProducts.forEach((subProduct) => {
			classifySubProductAndAddQueue(subProduct);
		});
	}
}

export async function removeInstancesRanking() {
	const randomUser = await User.findOne();
	const token = await generateTokenCms(randomUser);
	const runningCrawlersResponse = await axios.get(config.crawlDomain, {
		headers: { Authorization: `Bearer ${token.token}` },
	});
	const runningCrawlers = runningCrawlersResponse.data.data;
	const crawlersProduct = runningCrawlers.filter((item) => {
		return item.instance_name.indexOf('ranking') >= 0;
	});
	await Promise.all(
		map(crawlersProduct, (runningCrawler) => deleteCrawler(runningCrawler.ip, token.token))
	);
}

export async function removeAllCrawler() {
	const randomUser = await User.findOne();
	const token = await generateTokenCms(randomUser);
	const runningCrawlersResponse = await axios.get(config.crawlDomain, {
		headers: { Authorization: `Bearer ${token.token}` },
	});
	const runningCrawlers = runningCrawlersResponse.data.data;
	const crawlersProduct = runningCrawlers.filter((item) => {
		return item.instance_name.indexOf('ranking') < 0;
	});
	await Promise.all(
		map(crawlersProduct, (runningCrawler) => deleteCrawler(runningCrawler.ip, token.token))
	);
}

export async function createNewCrawlers() {
	const randomUser = await User.findOne();
	const token = await generateTokenCms(randomUser);
	const listInstanceName = [
		'yahoo_detail',
		'rakuten_detail',
		'amazon_detail',
		'rakuten_detail',
		'yahoo_search',
		'rakuten_search',
	];
	const listBody = map(listInstanceName, (instanceName) => {
		return {
			instance_snapshot_name: instanceName.includes('rakuten')
				? config.instanceSnapshotRakutenName
				: config.instanceSnapshotAmazonYahooName,
			instance_name: instanceName,
			bundle_id: 'medium_2_0',
			data: [{ count: 5, name: instanceName }],
		};
	});
	await Promise.all(map(listBody, (body) => createCrawler(body, token.token)));
}

export async function createInstancesRanking() {
	const randomUser = await User.findOne();
	const token = await generateTokenCms(randomUser);
	const listInstanceName = [
		'yahoo_ranking',
		'rakuten_ranking',
		'amazon_ranking'
	];
	const listBody = map(listInstanceName, (instanceName) => {
		return {
			instance_snapshot_name: instanceName.includes('rakuten')
				? config.instanceSnapshotRakutenName
				: config.instanceSnapshotAmazonYahooName,
			instance_name: instanceName,
			bundle_id: 'medium_2_0',
			data: [{ count: 5, name: instanceName }],
		};
	});
	await Promise.all(map(listBody, (body) => createCrawler(body, token.token)));
}

async function createCrawler(body, token: string) {
	return await axios.post(config.crawlDomain, body, {
		headers: { Authorization: `Bearer ${token}` },
	});
}

async function deleteCrawler(ip: string, token: string) {
	if (!ip) return;
	return await axios.delete(`${config.crawlDomain}/${ip}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
}

export async function recrawlAfterLongTime() {
	const productFactoryFindConditions = {
		$or: [{ asinCode: { $nin: [null, ''] } }, { janCode: { $nin: ['', null] } }],
	};
	const productFactoryLength = await ProductFactory.countDocuments(productFactoryFindConditions);
	const RECORD_LIMIT = 100;
	const totalPages = Math.ceil(productFactoryLength / RECORD_LIMIT);

	for (let i = 0; i < totalPages; i++) {
		const productFactories = await ProductFactory.find()
			.skip(RECORD_LIMIT * i)
			.limit(RECORD_LIMIT);
		// lấy mảng asin hoặc jancode mà không null.
		const asinCodesFromFactories = compact(map(productFactories, 'asinCode'));
		const janCodesFromFactories = compact(map(productFactories, 'janCode'));

		// tìm đã có subProduct hay chưa?
		const lstSubProductByListAsin = await SubProduct.find({
			'code.value': { $in: asinCodesFromFactories },
		});

		const lstSubProductByListJancode = await SubProduct.find({
			'code.value': { $in: janCodesFromFactories },
		});

		console.log('lstSubProductByListAsin', lstSubProductByListAsin);

		const lstValueOfAsinCodeSubProduct = compact(map(lstSubProductByListAsin, 'code.value'));
		const lstValueOfJanCodeSubProduct = compact(map(lstSubProductByListJancode, 'code.value'));

		const asinCodeToSearchQueue = asinCodesFromFactories.filter((item) => {
			return lstValueOfAsinCodeSubProduct.indexOf(item) < 0;
		});

		const janCodeToSearchQueue = janCodesFromFactories.filter(
			(item) => lstValueOfJanCodeSubProduct.indexOf(item) < 0
		);

		asinCodeToSearchQueue.map(async (item) => {
			await handleAsinCode(item);
		});
		janCodeToSearchQueue.map(async (item) => {
			await handleJanCode(item);
		});
	}
}

function classifySubProductAndAddQueue(subProduct: {
	urlProduct: string;
	source: string;
	code: any;
}) {
	if (subProduct.source === SourceProduct.AMAZON) {
		return pushDataToCrawlerRedis(
			subProduct.urlProduct,
			RedisCrawlerQueue.AMAZONE_DETAIL,
			connRedisUrl
		);
	}
	if (subProduct.source === SourceProduct.YAHOO || subProduct.source === SourceProduct.PAYPAY) {
		let janCode = subProduct?.code?.value;
		return pushDataToCrawlerRedis(
			(subProduct.urlProduct = janCode
				? subProduct.urlProduct.includes('?')
					? subProduct.urlProduct + '&jancode=' + janCode
					: subProduct.urlProduct + '?jancode=' + janCode
				: subProduct.urlProduct),
			RedisCrawlerQueue.YAHOO_DETAIL,
			connRedisUrl
		);
	}
	if (subProduct.source === SourceProduct.RAKUTEN) {
		let janCode = subProduct?.code?.value;
		return pushDataToCrawlerRedis(
			(subProduct.urlProduct = janCode
				? subProduct.urlProduct.includes('?')
					? subProduct.urlProduct + '&jancode=' + janCode
					: subProduct.urlProduct + '?jancode=' + janCode
				: subProduct.urlProduct),
			RedisCrawlerQueue.RAKUTEN_DETAIL,
			connRedisUrl
		);
	}
}

export async function mappingAmazonToProduct(codeMap) {
	const amazonSubProds = await SubProduct.find({
		source: SourceProduct.AMAZON,
		sku: { $in: codeMap.asin },
		active: true,
		$or: [{ productId: { $eq: null } }, { productId: { $exists: false } }],
	});
	if (!amazonSubProds.length) return;
	const othersSubProds = await SubProduct.find({
		productId: { $exists: true },
		source: { $ne: SourceProduct.AMAZON },
		'code.value': codeMap._id,
		active: true,
	});
	if (othersSubProds.length > 0) {
		await CodeMap.updateMany(
			{ asin: { $in: map(amazonSubProds, getObjectId) } },
			{ isProcessed: true }
		);
		const product = await Product.findOne({ _id: othersSubProds[0].productId }); //WARNING product
		await SubProduct.updateMany(
			{ _id: { $in: map(amazonSubProds, getObjectId) } },
			{ productId: getObjectId(product) }
		);
		const asinCodes = _.map(amazonSubProds, (subProd) => ({
			value: subProd.sku,
			codeType: CodeType.ASIN,
		}));

		product.price = _.minBy(amazonSubProds, 'price')['price'] || 0;
		product.codes = concat(product.codes, asinCodes);
		product.longDescriptions = !product.longDescriptions?.length
			? amazonSubProds[0].longDescriptions
			: product.longDescriptions;
		product.shortDescriptions = !product.shortDescriptions?.length
			? amazonSubProds[0].shortDescriptions
			: product.shortDescriptions;
		await product.save();
		const asinCodesText = _.join(map(asinCodes, 'value'));
		log('Product').info(`ASIN codes ${asinCodesText} created!`);
		const productFactories = map(codeMap.asin, (code) => {
			const urlProduct = `https://www.amazon.co.jp/dp/${code}`;
			const source = SourceProduct.AMAZON;
			return addUrlToProductFactory(urlProduct, code, source);
		});
		await Promise.all(productFactories);
		return;
	}

	const codes = map(amazonSubProds, (subProd) => {
		return { value: subProd.sku, codeType: CodeType.ASIN };
	});

	const product = new Product({
		//WARNING product
		title: get(amazonSubProds[0], 'title', '製品の名前がない'),
		longDescriptions: get(amazonSubProds[0], 'longDescriptions', []),
		shortDescriptions: get(amazonSubProds[0], 'shortDescriptions', []),
		thumbnail: _.head(amazonSubProds[0]?.images) || env.noImageLink,
		images: amazonSubProds[0]?.images,
		codes: codes,
		price: get(amazonSubProds[0], 'price', 0),
	});
	product.codes = codes;
	await product.save();

	await SubProduct.updateMany(
		{ _id: { $in: map(amazonSubProds, getObjectId) } },
		{ productId: getObjectId(product) }
	);

	const asinCodesText = _.join(map(codes, 'value'));
	log('Product').info(`ASIN codes ${asinCodesText} created!`);
	const productFactories = map(codeMap.asin, (code) => {
		const urlProduct = `https://www.amazon.co.jp/dp/${code}`;
		const source = SourceProduct.AMAZON;
		return addUrlToProductFactory(urlProduct, code, source);
	});
	await Promise.all(productFactories);
	return;
}

export async function createJobMappingAmazonToProduct() {
	const codeMaps = await CodeMap.aggregate()
		.match({ ean: { $ne: null }, isProcessed: false })
		.group({ _id: '$ean', asin: { $push: '$asin' } })
		.match({ _id: { $ne: null } });
	processCodeMaps(codeMaps);
}

export async function processCodeMaps(codeMaps: any[]) {
	await Bluebird.each(codeMaps, async (codeMap) => {
		await mappingAmazonToProduct(codeMap);
	});
	return;
}

export async function checkSubProductExists(productId) {
	let subProducts = await SubProduct.find({ productId: getObjectId(productId), active: true });
	subProducts = uniqBy(subProducts, (subProduct: any) =>
		[subProduct.source, subProduct.store, subProduct.price].join()
	);
	return !!subProducts.length;
}

export async function removeAllProductNoSub() {
	const products = await Product.aggregate()
		.match({ active: true })
		.lookup({
			from: 'subproducts',
			localField: '_id',
			foreignField: 'productId',
			as: 'subProducts',
		})
		.project({
			_id: '$_id',
			subProductCount: {
				$cond: { if: { $isArray: '$subProducts' }, then: { $size: '$subProducts' }, else: 'NA' },
			},
		})
		.match({ subProductCount: 0 });
	return await Product.deleteMany({ _id: { $in: map(products, '_id') } });
}

export async function updateMinPriceOfProduct() {
	const products = await Product.aggregate()
		.match({ active: true, price: { $gte: 1 } })
		.lookup({
			from: 'subproducts',
			localField: '_id',
			foreignField: 'productId',
			as: 'subProducts',
		})
		.project({
			_id: '$_id',
			subProductCount: {
				$cond: { if: { $isArray: '$subProducts' }, then: { $size: '$subProducts' }, else: 'NA' },
			},
			currentProductPrice: '$price',
			minPriceOfSubProducts: { $min: '$subProducts.price' },
			subProducts: { source: '$subProducts.source', price: '$subProducts.price' },
		})
		.match({ subProductCount: { $gt: 0 } })
		.match({ $expr: { $gt: ['$minPriceOfSubProducts', '$currentProductPrice'] } })
		.unwind('$subProducts');
	if (!products.length) {
		return;
	}
	const updateConditions = [];
	products.forEach((product) => {
		const indexOfMinPrice = indexOf(product.subProducts.price, product.minPriceOfSubProducts);
		updateConditions.push({
			updateOne: {
				filter: { _id: product._id },
				update: {
					price: product.minPriceOfSubProducts,
					sourceMinPrice: product.subProducts.source[indexOfMinPrice],
				},
			},
		});
	});
	if (!updateConditions.length) {
		return;
	}
	await Product.bulkWrite(updateConditions);
}

export async function getProductByCodeValue(code: any) {
	return await Product.find({ 'codes.value': { $in: code.codes } }).select('codes');
}

export async function fixSubProduct() {
	const subProducts = await SubProduct.find({ $where: 'this.code.value == this.urlProduct' })
		.limit(5000)
		.skip(0)
		.sort({ _id: 1 });
	subProducts.map(async (subProduct) => {
		const product = await Product.findOne({ _id: getObjectId(subProduct.productId) });
		let janCode;

		if (product && product.codes) {
			product.codes.map((code) => {
				if (code.codeType === 'JAN_CODE') janCode = code.value;
			});
			if (janCode) {
				await SubProduct.updateOne(
					{ _id: getObjectId(subProduct) },
					{ code: { value: janCode, codeType: 'JAN_CODE' } }
				);
			}
		}
	});
	return;
}
