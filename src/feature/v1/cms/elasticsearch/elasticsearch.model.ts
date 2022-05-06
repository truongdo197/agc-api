import _ from 'lodash';
import esClient from '$config/elaticsearch';
import SubProduct from '$schema/SubProduct';

import Metric from '$schema/Metric';

import { PagingParams } from '$interface/Pagination.definition';
import log from '$config/log';
import { IMetric } from './elasticsearch.interface';
import { getObjectId } from '$utils/utils';
import Product from '$schema/Product';
import { ModelName } from '$enum/common';
import Bluebird from 'bluebird';
const logger = log('Elasticsearch');
/**
 * bulk documents
 */
export async function createBulkDocuments(body: Array<object>) {
	const result = await esClient.bulk({ refresh: true, body });
	// logger.info(`Insert ${body.length} completed!`);
	return result;
}
/**
 *
 * @param indexName name of Index
 * count documents of index
 */
export async function countDocuments(indexName: any) {
	const { body } = await esClient.count({ index: indexName });
	return body;
}
/**
 *
 * @param indexName name of index
 * @param type name of type (table)
 * @param id id 's document
 * check row exist
 */
export async function checkDocumentExist(indexName: string, type: string, id: any) {
	const exist = await esClient.exists({
		index: indexName,
		type,
		id,
	});
	return { document: exist.body };
}

export async function getSubProductFromMongo(params: PagingParams) {
	const subProduct = await SubProduct.find()
		.populate({
			path: 'productId',
			model: ModelName.PRODUCT,
			select: 'title thumbnail tag price reviews comments',
		})
		.limit(params.pageSize)
		.skip(params.start);

	return subProduct;
}
export async function getTotalSubProduct() {
	return await SubProduct.countDocuments();
}

export async function getTotalProduct() {
	return await Product.countDocuments();
}

export async function getMetric() {
	return await Metric.findOne();
}

export async function updateMetric(params: IMetric) {
	if (params._id) return await Metric.updateOne({ _id: getObjectId(params._id) }, params);
	const metric = new Metric({ ...params });
	return await metric.save();
}

export async function getSubProductsByProductId(productId: string) {
	return await SubProduct.find({ productId: getObjectId(productId) }).populate({
		path: 'productId',
		model: ModelName.PRODUCT,
		select: 'title thumbnail tag price',
	});
}
