import { IListProduct } from './product.interface';
import Product from '$schema/Product';
import { returnPaging, getObjectId } from '$utils/utils';
import moment from 'moment';
import { assignIn, uniqBy } from 'lodash';

import SubProduct from '$schema/SubProduct';
import { IProduct, ISubProduct } from '$types/interface/Product.definition';
import { Schema } from 'mongoose';
import { ParamsReturnPaging } from '$types/interface/Pagination.definition';
import { makeKeywordConditions } from '../../../../utils/utils';
import Metric from '../../../../schema/Metric';
import CodeMap from '$schema/CodeMap';
import esClient from '$config/elaticsearch';
import config from '$config/env';
import { ErrorCode } from '$enum/common';
export async function getListProduct(params: IListProduct) {
	const conditions = {
		active: true,
	};

	if (params.keyword) {
		conditions['$or'] = [
			{ title: { $in: makeKeywordConditions(params.keyword) } },
			{ 'codes.value': params.keyword },
		];
	}
	const data = await Product.find(conditions)
		.populate({
			path: 'tag',
			select: 'name category',
			populate: { path: 'category', select: 'name' },
		})
		.limit(params.pageSize)
		.skip(params.start)
		.sort('-createdAt');
	const totalItem = await Product.countDocuments(conditions);
	return returnPaging(data, totalItem, params);
}

export async function getListSubProduct(params: ParamsReturnPaging) {
	const conditions = {};
	if (params.keword) {
		conditions['title'] = { $in: makeKeywordConditions(params.keyword) };
	}
	const data = await SubProduct.find(conditions)
		.limit(params.pageSize)
		.skip(params.start)
		.sort('-createdAt');
	const totalItem = await SubProduct.countDocuments(conditions);
	return returnPaging(data, totalItem, params);
}

export async function createProduct(product: IProduct) {
	const newProduct = new Product(product);
	return await newProduct.save();
}

export async function updateProductIdForSubProduct(
	subProductIds: Schema.Types.ObjectId[],
	productId: string
) {
	return await SubProduct.updateMany(
		{ _id: { $in: subProductIds } },
		{ productId: getObjectId(productId) }
	);
}

export async function insertManySubProduct(subProducts: ISubProduct[]) {
	return await SubProduct.insertMany(subProducts);
}

export async function createSubProduct(subProduct: ISubProduct) {
	const newSubProduct = new SubProduct(subProduct);
	return await newSubProduct.save();
}

export async function deleteProduct(id: string, userId: string) {
	await SubProduct.updateMany({ productId: getObjectId(id) }, { active: false });
	const product = await getProductById(id);
	const tmp = {
		deletedAt: moment().toDate(),
		active: false,
		deletedBy: getObjectId(userId),
	};
	assignIn(product, tmp);
	await esClient.deleteByQuery({
		index: config.elasticsearch.indexName,
		body: { query: { match: { productId: id } } },
	});
	return await product.save();
}
export async function getProductById(id: string) {
	return await Product.findById(getObjectId(id));
}
export async function getDetailProduct(productId: string) {
	const product = await Product.findOne({ _id: getObjectId(productId), active: true }).populate(
		'similarProducts'
	);
	if (!product) {
		throw ErrorCode.Not_Found;
	}
	let subProducts = await SubProduct.find({ productId: getObjectId(productId), active: true });
	subProducts = uniqBy(subProducts, (subProduct: any) =>
		[subProduct.source, subProduct.store, subProduct.price].join()
	);

	return { product, subProducts };
}

export async function updateSubProduct(subProductId: string, body: ISubProduct) {
	return await SubProduct.updateOne({ _id: subProductId }, { ...body });
}

export async function updateLastTimeMappingSubProduct() {
	return await Metric.updateOne({}, { lastTimeUpdateProduct: moment().toDate() });
}

export async function createCodeMap(body) {
	const codeMap = new CodeMap(body);
	return await codeMap.save();
}
