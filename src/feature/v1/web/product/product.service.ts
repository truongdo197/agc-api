import { IListProduct } from './product.interface';
import * as model from './product.model';
import * as modelES from './product.elasticsearch';
import _, { isEqual, result } from 'lodash';
import { addJobs } from '$config/jobs/jobAction';
import { actionQueue } from '$config/jobs/Queue';
import { PagingParams, ParamsReturnPaging } from '$types/interface/Pagination.definition';
import { ErrorCode } from '$enum/common';
import Product from '$schema/Product';
import CodeMap from '$schema/CodeMap';
import Bluebird from 'bluebird';
import { returnPaging } from '$utils/utils';
import ProductFactory from '$schema/ProductFactory';
import FavoriteProduct from '$schema/FavoriteProduct';
import { getObjectId } from '$utils/utils';
import ProductHistory from '$schema/ProductHistory';
import Schema from 'mongoose';
import { map, find, get } from 'lodash';
import moment from 'moment';

export async function getListProduct(params: IListProduct) {
	return await model.getListProduct(params);
}

export async function getDetailProduct(productId: string, memberId?: string) {
	return await model.getDetailProduct(productId, memberId);
}

export async function getDetailProductByJanCode(janCode: string) {
	return await model.getDetailProductByJanCode(janCode);
}

export async function getHotProductList(limit: number, memberId?: string) {
	return await model.getHotProductList(limit, memberId);
}

export async function searchProduct(params: IListProduct) {
	if (params.category) {
		const tags = await modelES.getListTagByCategoryId(params.category);
		params.tags = tags || [];
	} else if (params.tags) {
		const tags = await modelES.getListTag(params.tags);
		params.tags = tags || [];
	}
	// if (params.keyword) {
	// 	addJobs(actionQueue, 'Increase numbers of keyword', params.keyword);
	// }
	const productFactory = await ProductFactory.findOne({
		$or: [{ asinCode: params.keyword }, { janCode: params.keyword }],
	});
	if (productFactory && params.keyword) {
		const codeValues = _.compact([productFactory.janCode, productFactory.asinCode]);
		const products = await Product.find({ 'codes.value': { $in: codeValues }, active: true });
		if (products) {
			const results = [];
			await Bluebird.each(codeValues, async (code) => {
				params.keyword = code;
				const resultSearch = await modelES.searchProduct(params);
				if (resultSearch.data.length) {
					results.push(resultSearch.data[0]);
				}
			});
			const productsWithMoreInfo = await model.getMoreInfoSubProducts(results, params.memberId);
			return returnPaging(productsWithMoreInfo, results.length, params);
		}
	}
	return await modelES.searchProduct(params);
}

export async function getKeywordList(params: ParamsReturnPaging) {
	return model.getKeywordList(params);
}

export async function getListProductSimilar(productId: string) {
	const product = await model.getProductById(productId);
	if (!product) throw ErrorCode.Product_Simiar_Not_Exist;
	const keyword = product?.title;
	const similarProducts = product?.similarProducts;
	return await modelES.getListProductSimilar(productId, keyword, similarProducts);
}
export async function getAdvertisingProductList(params: PagingParams) {
	const productCodeIds = await model.getListProductCodeIdByCommonId();
	const sliceProductIds = _.slice(
		productCodeIds?.items,
		params.start,
		params.start + params.pageSize
	);
	return await model.getAdvertisingProductList(params, sliceProductIds);
}

export async function getTopViewProducts(params: ParamsReturnPaging) {
	return await model.getTopViewProducts(params);
}

export async function getProductByIds(productIds: string[]) {
	return await model.getProductByIds(productIds);
}

interface IProductHistory {
	product: string;
}
export async function addProductHistory(
	memberId: string | Schema.Types.ObjectId,
	body: IProductHistory
) {
	const isProductExist = await Product.findOne({ _id: getObjectId(body.product) });
	if (!isProductExist) {
		throw ErrorCode.Not_Found;
	}
	const productHistorySaved = await ProductHistory.findOne({
		product: getObjectId(body.product),
		member: getObjectId(memberId),
	});
	if (productHistorySaved) {
		productHistorySaved.updatedAt = moment().toDate();
		return await productHistorySaved.save();
	}
	const productHistory = new ProductHistory({
		product: body.product,
		member: memberId,
	});
	return await productHistory.save();
}

interface IListProductHistory extends ParamsReturnPaging {
	memberId: string;
}
export async function getListProductHistory(params: IListProductHistory) {
	const conditions = {
		member: getObjectId(params.memberId),
	};
	const totalItems = await ProductHistory.countDocuments(conditions);
	const products = await ProductHistory.find(conditions)
		.populate('product', 'price thumbnail images createdAt title comments reviews')
		.limit(params.pageSize)
		.skip(params.start)
		.sort('-updatedAt')
		.lean();
	const favoriteProducts = await FavoriteProduct.find({
		member: getObjectId(params.memberId),
		product: { $in: map(products, 'product') },
	})
		.select('product')
		.lean();
	const productWithFavoriteStatus = map(products, (product) => {
		const markedAsFavorite = find(favoriteProducts, (item) => {
			return isEqual(item.product, get(product, 'product._id', ''));
		});
		return {
			...product,
			markedAsFavorite: !!markedAsFavorite,
		};
	});
	const product = await model.getMoreInfoSubProductsHistory(productWithFavoriteStatus);
	return returnPaging(product, totalItems, params);
}
