import { IListProduct } from './product.interface';
import Product from '$schema/Product';
import { returnPaging } from '$utils/utils';
import _, { some, uniqBy } from 'lodash';
import { getObjectId, genUrlReview } from '$utils/utils';

import Common from '$schema/Common';
import { CommonType, ErrorCode } from '$enum/common';
import SubProduct from '$schema/SubProduct';
import Keyword from '$schema/Keyword';
import { PagingParams, ParamsReturnPaging } from '$types/interface/Pagination.definition';
import { get, map, find, forEach } from 'lodash';
import { Schema } from 'mongoose';
import esClient from '$config/elaticsearch';
import env from '$config/env';
import Tag from '$schema/Tag';
import { IProduct } from '$types/interface/Product.definition';
import FavoriteProduct from '$schema/FavoriteProduct';

export async function getListProduct(params: IListProduct) {
	const conditions = {
		active: true,
		price: { $gt: 0 },
	};
	if (params.category) {
		const tags = await Tag.find({ category: getObjectId(params.category) }).select('_id');
		const valueTags = _.map(tags, (tag) => {
			return tag._id;
		});
		conditions['tag'] = { $in: valueTags };
	}
	let products = await Product.find(conditions)
		.limit(params.pageSize)
		.skip(params.start)
		.sort('-createdAt')
		.lean();
	const totalItems = await Product.countDocuments(conditions);

	return returnPaging(products, totalItems, params);
}

export async function getDetailProduct(productId: string, memberId?: string) {
	const productPromise = Product.findOne({ _id: getObjectId(productId), active: true }).populate({
		path: 'tag',
		select: 'name category',
		populate: {
			path: 'category',
			select: 'name',
		},
	});
	let subProductsPromise = SubProduct.find({ productId: getObjectId(productId), active: true });
	let [product, subProducts] = await Promise.all([productPromise, subProductsPromise]);

	if (!product) {
		throw ErrorCode.Not_Found;
	}
	const views = get(product, 'views', 0);
	product.views = views + 1;
	await product.save();
	subProducts = uniqBy(subProducts, (subProduct: any) =>
		[subProduct.source, subProduct.store, subProduct.price].join()
	);
	let urlReviews = _.map(subProducts, (subProd) => {
		return { source: subProd.source, urlReview: genUrlReview(subProd) };
	});
	urlReviews = uniqBy(urlReviews, (urlReview) => urlReview.source);

	if (product.shortDescriptions[0] === product.longDescriptions[0]) {
		product.shortDescriptions = [];
	}
	let isProductMarkedAsFavorite = false;
	if (memberId) {
		const countProductMarkedAsFavorite = await FavoriteProduct.countDocuments({
			product: getObjectId(productId),
			member: getObjectId(memberId),
		});
		if (countProductMarkedAsFavorite > 0) {
			isProductMarkedAsFavorite = true;
		}
	}
	return {
		product: { ...JSON.parse(JSON.stringify(product)), isProductMarkedAsFavorite },
		subProducts,
		urlReviews,
	};
}

export async function getHotProductList(limit: number, memberId?: string) {
	const common = await Common.findOne({ type: CommonType.HOT_PRODUCT })
		.populate({
			path: 'items',
			model: 'Product',
			select: 'title shortDescriptions thumbnail active reviews comments',
		})
		.lean()
		.exec();

	let chosenProductsByAdmin: Array<IProduct> = common.items as any;

	chosenProductsByAdmin = _.filter(chosenProductsByAdmin, (product) => product.active);

	const productNumbers = limit - chosenProductsByAdmin.length;
	if (productNumbers < 0) {
		return chosenProductsByAdmin.slice(0, limit);
	}

	let topViewProducts = [];
	if (productNumbers > 0) {
		topViewProducts = await Product.find({
			_id: { $nin: _.map(chosenProductsByAdmin, getObjectId) },
			active: true,
		})
			.sort('-views')
			.limit(productNumbers)
			.select('title description images views thumbnail reviews comments')
			.lean()
			.exec();
	}
	const products = [...chosenProductsByAdmin, ...topViewProducts];
	const productsWithMoreInfo = await getMoreInfoSubProducts(products, memberId);
	return productsWithMoreInfo;
}

export async function increaseNumbersOfKeyword(keyword: string) {
	const result = await Keyword.findOne({ keyword: keyword });
	if (!result) {
		const keywordSaved = new Keyword({ keyword });
		return await keywordSaved.save();
	}
	result.numbers += 1;
	return await result.save();
}

export async function getKeywordList(params: ParamsReturnPaging) {
	const condition = {};
	if (params.keyword) {
		condition['keyword'] = new RegExp(params.keyword);
	}
	const data = await Keyword.find(condition)
		.select('keyword -_id numbers')
		.limit(params.pageSize)
		.skip(params.start)
		.sort('-numbers');
	const totalItems = await Keyword.countDocuments(condition);
	return returnPaging(data, totalItems, params);
}

export async function getProductById(productId: string) {
	return await Product.findOne({ _id: getObjectId(productId) });
}

export async function getDetailProductByJanCode(janCode: string) {
	const productPromise = Product.findOne({ 'codes.value': janCode, active: true });
	let subProductsPromise = SubProduct.find({
		'code.value': janCode,
		active: true,
		productId: { $exists: true },
	});
	let [product, subProducts] = await Promise.all([productPromise, subProductsPromise]);
	if (!product) {
		throw ErrorCode.Not_Found;
	}
	const views = get(product, 'views', 0);
	product.views = views + 1;
	await product.save();
	subProducts = uniqBy(subProducts, (subProduct: any) =>
		[subProduct.source, subProduct.store, subProduct.price].join()
	);
	return { product, subProducts };
}

export async function getAdvertisingProductList(
	params: PagingParams,
	productIds: Array<Schema.Types.ObjectId>
) {
	const conditions = { active: true, _id: { $in: productIds } };
	const taskPromiseProduct = [];
	taskPromiseProduct.push(
		Product.find(conditions).select('title thumbnail'),
		Product.countDocuments(conditions)
	);
	const [products, totalItems] = await Promise.all(taskPromiseProduct);
	let listProductId = _.map(products, getObjectId);
	listProductId = _.filter(listProductId);
	const taskPromiseSubProduct = listProductId.map(
		async (productId) => await getSubProductByProductId(productId)
	);
	const productSortByIds = map(productIds, (productId) => {
		return find(products, (product) => _.isEqual(productId, getObjectId(product)));
	});
	const subProducts = await Promise.all(taskPromiseSubProduct);
	const resultSearch = handleMapSubProductWithProduct(subProducts, productSortByIds);
	return returnPaging(resultSearch, totalItems, params);
}

export async function getListProductCodeIdByCommonId() {
	return await Common.findOne({ type: CommonType.ADVERTISING_PRODUCT }).select('items');
}

async function getSubProductByProductId(productId: string) {
	const { body } = await esClient.search({
		index: env.elasticsearch.indexName,
		filter_path: ['hits.hits._source'],
		body: {
			query: {
				term: {
					productId: {
						value: productId,
					},
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
		const subProduct = subProducts.find((sub) => sub?.productId === product?._id + '');
		if (subProduct?.price) {
			listProductSimilar.push({
				...product?._doc,
				price: subProduct?.price || null,
				productId: subProduct?.productId || product?._id,
			});
		}
	});
	return listProductSimilar;
}

export async function getTopViewProducts(params: ParamsReturnPaging) {
	const conditions = { active: true, price: { $gt: 0 } };
	if (params.category) {
		const tags = await Tag.find({ category: getObjectId(params.category) });
		conditions['tag'] = { $in: map(tags, (tag) => getObjectId(tag)) };
	}
	if (params.tag) {
		conditions['tag'] = getObjectId(params.tag);
	}

	const totalItems = await Product.countDocuments(conditions);
	const products = await Product.find(conditions)
		.limit(params.pageSize)
		.skip(params.start)
		.sort('-views')
		.lean();
	const productsWithMoreInfo = await getMoreInfoSubProducts(products, params.memberId);

	return returnPaging(productsWithMoreInfo, totalItems, params);
}

export async function getMoreInfoSubProducts(products, memberId?: string) {
	const subProducts = await SubProduct.aggregate()
		.match({
			productId: { $in: map(products, (product) => getObjectId(product._id)) },
		})
		.sort({ price: 1 })
		.group({
			_id: '$productId',
			subProduct: {
				$first: {
					reviewsSummary: '$reviewsSummary',
					price: '$price',
					urlProduct: '$urlProduct',
					source: '$source',
					affiliateUrl: '$affiliateUrl'

				},
			},
		});

	const subProductMapById = {};
	forEach(subProducts, (subProduct) => {
		subProductMapById[`${subProduct._id}`] = subProduct;
	});
	const productsWithMoreInfo = map(products, (product) => {
		return {
			...product,
			subProductInfo: get(subProductMapById, `[${product._id}].subProduct`, null),
		};
	});
	if (memberId) {
		const favoriteProducts = await FavoriteProduct.find({
			member: getObjectId(memberId),
			product: { $in: map(products, (product) => getObjectId(product._id)) },
		})
			.lean()
			.exec();
		const productsWithFavoriteStatus = map(productsWithMoreInfo, (product) => {
			const status = some(
				favoriteProducts,
				(favoriteProduct) => JSON.stringify(favoriteProduct.product) == JSON.stringify(product._id)
			);
			return { ...product, markedAsFavorite: status };
		});
		return productsWithFavoriteStatus;
	}
	return productsWithMoreInfo;
}

export async function getMoreInfoSubProductsHistory(products) {
	const subProducts = await SubProduct.aggregate()
		.match({
			productId: { $in: map(products, (product) => getObjectId(product.product._id)) },
		})
		.sort({ price: 1 })
		.group({
			_id: '$productId',
			subProduct: {
				$first: {
					urlProduct: '$urlProduct',
					source: '$source',
					affiliateUrl: '$affiliateUrl'
				},
			},
		});
	const subProductMapById = {};
	forEach(subProducts, (subProduct) => {
		subProductMapById[`${subProduct._id}`] = subProduct;
	});
	const productsWithMoreInfo = map(products, (product) => {
		return {
			...product,
			subProductInfo: get(subProductMapById, `[${product.product._id}].subProduct`, null),
		};
	});
	return productsWithMoreInfo;
}

export async function getMinPriceOfProduct(productId: string | Schema.Types.ObjectId | object) {
	const subProdMinPrice = await SubProduct.aggregate()
		.match({ productId: getObjectId(productId) })
		.group({ _id: '$productId', price: { $min: '$price' } });

	const minPrice = _.get(subProdMinPrice, '[0].price', 0);
	return minPrice;
}

export async function getProductByIds(productIds: string[]) {
	const products = await Product.find({
		_id: { $in: productIds },
		active: true,
		price: { $gt: 0 },
	}).lean();

	return await getMoreInfoSubProducts(products);
}

export async function getListTagByCategoryId(categoryId: string) {
	return await Tag.find({ category: getObjectId(categoryId) });
}
