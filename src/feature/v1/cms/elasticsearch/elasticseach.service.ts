import * as model from './elasticsearch.model';
import _ from 'lodash';
import { ISubProduct } from './elasticsearch.interface';
import { getNumberFromString, getObjectId, setDataPaging } from '$utils/utils';
import { addJobs } from '$config/jobs/jobAction';
import { productQueue } from '$config/jobs/Queue';
import { JobName } from '$types/enum/common';
import { PagingParams } from '$interface/Pagination.definition';
import env from '$config/env';
import { getCodeMap } from '../product/product.service';
import { Schema } from 'mongoose';
import SubProduct from '$schema/SubProduct';
import config from '$config/env';
import Product from '$schema/Product';
import moment from 'moment';

export async function syncDataToElasticsearch(params: PagingParams) {
	const subProducts = await model.getSubProductFromMongo(params);
	const mapDataSubProducts = subProducts.map((subProduct: any) => {
		return mappingDataSubProduct(subProduct);
	});
	const body = [];
	mapDataSubProducts.forEach((data: any) => {
		body.push({ index: { _index: env.elasticsearch.indexName, _type: '_doc', _id: data._id } });
		delete data._id;
		body.push(data);
	});
	return await model.createBulkDocuments(body);
}

export async function addJobMigrateMongoToElasticsearch() {
	const pageSize = 5000;
	const totalSubProducts = await model.getTotalSubProduct();
	const totalPages = Math.ceil(totalSubProducts / pageSize);
	const listParams = [];
	for (let i = 0; i < totalPages; i++) {
		const pageIndex = i + 1;
		const param = setDataPaging({ pageIndex, pageSize });
		if (pageIndex === totalPages) param['lastPage'] = true;
		listParams.push(param);
	}
	listParams.forEach((param) => {
		addJobs(productQueue, JobName.MIGRATE_DATA_MONGO_TO_ELASTICSEARCH, param);
	});
}

export async function updateDocumentES(productId) {
	const subProducts = await model.getSubProductsByProductId(productId);
	const mapDataSubProducts = _.map(subProducts, mappingDataSubProduct);
	const body = [];
	mapDataSubProducts.forEach((data: any) => {
		body.push({ index: { _index: env.elasticsearch.indexName, _type: '_doc', _id: data._id } });
		delete data._id;
		body.push(data);
	});
	return await model.createBulkDocuments(body);
}

export async function getTotalItems(name: any) {
	return await model.countDocuments(name);
}

export async function checkDocumentExist(indexName: string, type: string, id: any) {
	return await model.checkDocumentExist(indexName, type, id);
}
export async function getMetric() {
	return await model.getMetric();
}
export async function addJobUpdateMetric() {
	await addJobs(productQueue, JobName.UPDATE_METRIC, null);
}
export async function updateMetric() {
	const taskPromise = [];
	const queryCountTotalProduct = model.getTotalProduct();
	const queryCountTotalSubProductMongo = model.getTotalSubProduct();
	const queryCountTotalSubProductEs = model.countDocuments(config.elasticsearch.indexName);

	taskPromise.push(
		queryCountTotalProduct,
		queryCountTotalSubProductMongo,
		queryCountTotalSubProductEs
	);
	const [countProduct, countSubProductMongo, countSubProductEs] = await Promise.all(taskPromise);
	const { bucketSize, dailyTokensLeft } = await getCodeMap('B08KGD6BN6');

	let metricExist: any = await model.getMetric();
	if (metricExist)
		metricExist = {
			_id: metricExist._id,
			totalProductsMongo: countProduct,
			totalSubProductsElasicsearch: countSubProductEs?.count,
			totalSubProductsMongo: countSubProductMongo,
			bucketSize,
			dailyTokensLeft,
		};
	else {
		metricExist = {
			totalProductsMongo: countProduct,
			totalSubProductsElasicsearch: countSubProductEs?.count,
			totalSubProductsMongo: countSubProductMongo,
			bucketSize,
			dailyTokensLeft,
		};
	}

	return await model.updateMetric(metricExist);
}

function mappingDataSubProduct(subProduct: ISubProduct) {
	return {
		code: subProduct.code,
		longDescriptions: subProduct.longDescriptions || '',
		shortDescriptions: subProduct.shortDescriptions || '',
		images: subProduct.images,
		active: subProduct.active,
		_id: subProduct._id,
		sku: subProduct.sku,
		title: subProduct.title,
		store: subProduct.store,
		price: getNumberFromString(subProduct.price) || 0,
		categories: subProduct.categories,
		source: subProduct.source,
		urlProduct: subProduct.urlProduct,
		createdAt: subProduct.createdAt,
		point: getNumberFromString(subProduct.point) || 0,
		status: subProduct?.status || 1,
		hasFee: subProduct.hasFee,
		productId: subProduct?.productId?._id || null,
		productTitle: subProduct?.productId?.title || null,
		productTag: subProduct?.productId?.tag || null,
		productThumbnail: subProduct?.productId?.thumbnail || null,
		productMinPrice: subProduct?.productId?.price,
		comments: subProduct?.productId?.comments || 0,
		reviews: subProduct?.productId?.reviews || 0,
	};
}

export async function getMinPriceOfProduct(productId: string | Schema.Types.ObjectId | object) {
	const subProdMinPrice = await SubProduct.aggregate()
		.match({ productId: getObjectId(productId) })
		.group({ _id: '$productId', price: { $min: '$price' } });
	const minPrice = _.get(subProdMinPrice, '[0].price', 0);
	return minPrice;
}
