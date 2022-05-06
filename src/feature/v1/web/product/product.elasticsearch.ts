import _, { findIndex, lowerCase, map } from 'lodash';
import {
	getObjectId,
	getRandomNumber,
	handleShufferItemInArray,
	mergeCollections,
	returnPaging,
	setDataPaging,
} from '$utils/utils';
import { IListProduct } from './product.interface';
import env from '$config/env';
import esClient from '$config/elaticsearch';
import Product from '$schema/Product';
import Tag from '$schema/Tag';
import escapeStringRegexp from 'escape-string-regexp';
import { Schema } from 'mongoose';
import SubProduct from '$schema/SubProduct';
import { getMoreInfoSubProducts } from './product.model';

export async function searchProduct(params: IListProduct, shuffer = false) {
	let query = null;
	if ((params.category || params.tags) && params.keyword) {
		query = {
			bool: {
				must: [
					{
						multi_match: {
							query: params.keyword,
							fields: ['productTitle^3', 'title^2', 'code.value'],
						},
					},
				],
				filter: [
					{
						exists: {
							field: 'productId',
						},
					},
					{
						terms: {
							productTag: params.tags,
						},
					},
				],
			},
		};
	}
	if (params.keyword && !params.category && !params.tags) {
		query = {
			bool: {
				must: [
					{
						multi_match: {
							query: params.keyword,
							fields: ['productTitle^3', 'title^2', 'code.value'],
						},
					},
				],
				filter: [
					{
						exists: {
							field: 'productId',
						},
					},
				],
			},
		};
	}
	if ((params.category || params.tags) && !params.keyword) {
		query = {
			bool: {
				must: [
					{
						match_all: {},
					},
				],
				filter: [
					{
						exists: {
							field: 'productId',
						},
					},
					{
						terms: {
							productTag: params.tags,
						},
					},
				],
			},
		};
	}
	if (!params.category && !params.keyword && !params.tags) {
		query = {
			bool: {
				must: [
					{
						match_all: {},
					},
				],
				filter: [
					{
						exists: {
							field: 'productId',
						},
					},
				],
			},
		};
	}

	const filter = [];
	if (!!params.filter) {
		if (params.filter.price) {
			filter.push({
				range: {
					price: {
						gte: params.filter.price[0],
						lte: params.filter.price[1],
					},
				},
			});
		}
		if (params.filter.reviews) {
			filter.push({
				range: {
					reviews: { gte: params.filter.reviews },
				},
			});
		}
		if (params.filter.brand) {
			filter.push({
				term: {
					source: lowerCase(params.filter.brand),
				},
			});
		}
		filter.map((item) => {
			query.bool.filter.push(item);
		});
	}

	let conditions;
	if (!params.sort) conditions = { createdAt: 'desc' };
	else if (params.sort.indexOf('-') === 0) {
		const sort = 'desc';
		const sortBy = params.sort.slice(1);
		conditions = { [sortBy]: sort };
	} else {
		const sort = 'asc';
		const sortBy = params.sort;
		conditions = { [sortBy]: sort };
	}
	const { body } = await esClient.search({
		index: env.elasticsearch.indexName,
		body: {
			query: query,
			sort: [
				conditions,
				{
					_score: 'desc',
				},
			],
			collapse: {
				field: 'productId',
			},
			aggs: {
				department_count: {
					cardinality: {
						field: 'productId',
					},
				},
			},
			size: params.pageSize,
			from: params.start,
		},
	});
	if (!body.hits.hits.length && params.pageIndex !== 1) {
		params.pageIndex -= 1;
		const paramsLoop = setDataPaging(params);
		return await searchProduct(paramsLoop, true);
	}
	return handleReturnResultSearch(body, params, shuffer);
}

async function handleReturnResultSearch(data, params: IListProduct, shuffer = false) {
	let result = _.map(data?.hits?.hits, (subProduct) => {
		return {
			_id: subProduct?._source.productId,
			title: subProduct?._source.productTitle,
			thumbnail: subProduct?._source.productThumbnail,
			price: subProduct?._source.productMinPrice,
			comments: subProduct?._source.comments,
			reviews: subProduct?._source.reviews,
			createdAt: subProduct?._source.createdAt,
		};
	});
	if (shuffer) {
		if (result.length === params.pageSize) {
			const sliceNumber = getRandomNumber(5, 10);
			result.slice(sliceNumber);
		}
		result = handleShufferItemInArray(result);
	}
	const products = await getMoreInfoSubProducts(result, params.memberId);
	return returnPaging(products, data?.aggregations?.department_count?.value, params);
}

export async function getListProductSimilar(
	originProductId: string,
	keyword: string,
	similarProducts: Array<Schema.Types.ObjectId>
) {
	let listProductSimilar = [];
	listProductSimilar = await getListProductByIds(similarProducts);
	if (listProductSimilar && Array.isArray(listProductSimilar) && listProductSimilar.length >= 4) {
		return handleMapProduct(listProductSimilar);
	}
	const { body } = await esClient.search({
		index: env.elasticsearch.indexName,
		filter_path: ['hits.hits._source'],
		body: {
			query: {
				bool: {
					must: [
						{
							multi_match: {
								query: keyword,
								fields: ['title^3'],
							},
						},
						{
							term: {
								active: {
									value: true,
								},
							},
						},
					],
					must_not: [
						{
							term: {
								productId: {
									value: originProductId,
								},
							},
						},
					],
					filter: {
						exists: {
							field: 'productId',
						},
					},
				},
			},
			sort: {
				_score: 'desc',
			},
			collapse: {
				field: 'productId',
			},
			size: 4,
		},
	});
	const convertData = JSON.parse(JSON.stringify(body));
	const listProductId = _.map(convertData?.hits?.hits, '_source.productId');
	const queryProduct = Product.find({ _id: { $in: listProductId } });
	const taskPromiseSubProduct = listProductId.map(
		async (productId) => await getSubProductByProductId(productId)
	);
	const resultPromise = await Promise.all([queryProduct, ...taskPromiseSubProduct]);
	const products = _.slice(resultPromise, 0, 1)?.[0];
	const subProducts = _.slice(resultPromise, 1, resultPromise.length);
	let listProductELasticsearch = handleMapSubProductWithProduct(subProducts, products);
	const totalProductSimilar = listProductSimilar.length;
	listProductELasticsearch = listProductELasticsearch.splice(0, 4 - totalProductSimilar);
	const productsSimilar = [...handleMapProduct(listProductSimilar), ...listProductELasticsearch];
	return productsSimilar;
}

async function getSubProductByProductId(productId: string) {
	const { body } = await esClient.search({
		index: env.elasticsearch.indexName,
		filter_path: ['hits.hits._source'],
		body: {
			query: {
				bool: {
					must: [
						{
							term: {
								productId: {
									value: productId,
								},
							},
						},
						{
							term: {
								status: {
									value: 1,
								},
							},
						},
					],
				},
			},
			sort: [
				{
					price: {
						order: 'asc',
					},
				},
			],
			size: 1,
		},
	});
	return _.map(body?.hits?.hits, '_source')[0];
}

function handleMapSubProductWithProduct(subProducts, products) {
	const listProductSimilar = [];
	_.forEach(products, (product) => {
		const subProduct = subProducts.find((sub) => sub?.productId === product._id + '');
		listProductSimilar.push({
			...product?._doc,
			price: subProduct?.price || null,
			point: subProduct?.point || null,
			source: subProduct?.source || null,
			store: subProduct?.store || null,
			urlProduct: subProduct?.urlProduct || null,
			urlReview: subProduct?.urlReview || null,
			productId: subProduct?.productId || product._id,
			reviewsSummary: subProduct?.reviewsSummary || null,
		});
	});
	return listProductSimilar;
}

function handleMapProduct(products) {
	const listProductSimilar = [];
	_.forEach(products, (product) => {
		listProductSimilar.push({
			...product,
			source: product?.source || null,
			productId: product?._id,
		});
	});
	return listProductSimilar;
}

export async function getListTagByCategoryId(categoryId: string) {
	const tags = await Tag.find({ category: getObjectId(categoryId) }).select('_id');
	return _.map(tags, (tag) => {
		return tag._id;
	});
}

export async function getListTag(ids: Array<any>) {
	const tags = await Tag.find({ _id: { $in: map(ids, (tag) => getObjectId(tag)) } });
	return _.map(tags, (tag) => {
		return tag._id;
	});
}

export async function getListProductByIds(productIds: Array<Schema.Types.ObjectId>) {
	const ids = _.map(productIds, getObjectId);

	const products = await Product.find({ _id: { $in: ids } }).lean();
	const productsWithSourcePromise = _.map(products, async (product) => {
		const subProduct = await SubProduct.findOne({ productId: product._id, price: product.price });
		return { ...product, source: subProduct?.source };
	});
	return await Promise.all(productsWithSourcePromise);
}
