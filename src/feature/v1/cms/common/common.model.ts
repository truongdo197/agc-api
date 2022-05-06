import Common from '../../../../schema/Common';
import { CommonType } from '$enum/common';
import { getObjectId, returnPaging } from '$utils/utils';
import { find, map } from 'lodash';
import Product from '$schema/Product';
import { PagingParams } from '$interface/Pagination.definition';
import { Schema } from 'mongoose';
import esClient from '$config/elaticsearch';
import env from '$config/env';
import _ from 'lodash';

export async function getHotProductList() {
	const common = await getHotProductCommon();
	return common;
}

export async function updateSettingSponsorProduct(items: string[]) {
	return await Common.updateOne(
		{ type: CommonType.SPONSOR_PRODUCT },
		{ items: map(items, getObjectId) }
	);
}

export async function getSettingSponsorProductList() {
	const common = await Common.findOne({ type: CommonType.SPONSOR_PRODUCT }).populate({
		path: 'items',
		match: { active: true },
		model: 'Banner',
	});
	if (!common) {
		const newCommon = new Common({ type: CommonType.SPONSOR_PRODUCT, items: [] });
		return await newCommon.save();
	}
	return common;
}

export async function updateHotProductList(productIds: string[]) {
	const result = await Common.updateOne(
		{ type: CommonType.HOT_PRODUCT },
		{ items: map(productIds, getObjectId) }
	);
	if (!result.n) {
		const common = new Common({
			type: CommonType.HOT_PRODUCT,
			items: map(productIds, (productId) => getObjectId(productId)),
		});
		await common.save();
		return common;
	}
	return result;
}

export async function getHotProductCommon() {
	const common = await Common.findOne({ type: CommonType.HOT_PRODUCT }).populate({
		path: 'items',
		model: 'Product',
	});
	return common;
}

export async function getNewsCommon() {
	const common = await Common.findOne({ type: CommonType.NEWS }).populate({
		path: 'items',
		model: 'Post',
		populate: [
			{
				path: 'category',
				select: 'name',
			},
			{
				path: 'createdBy',
				select: 'fullName',
			},
		],
	});
	return common;
}

export async function getNewProductCommon() {
	const common = await Common.findOne({ type: CommonType.NEW_PRODUCT }).populate({
		path: 'items',
		model: 'Post',
		populate: [
			{
				path: 'category',
				select: 'name',
			},
			{
				path: 'createdBy',
				select: 'fullName',
			},
		],
	});
	return common;
}

export async function updateAdvertisingProductList(productIds: Array<string>) {
	const result = await Common.updateOne(
		{ type: CommonType.ADVERTISING_PRODUCT },
		{ items: map(productIds, getObjectId) }
	);
	if (!result.n) {
		const advertisingProductCommon = new Common({
			type: CommonType.ADVERTISING_PRODUCT,
			items: map(productIds, (productId) => getObjectId(productId)),
		});
		await advertisingProductCommon.save();
		return advertisingProductCommon;
	}
	return result;
}

export async function getAdvertisingProductList(
	params: PagingParams,
	productIds: Array<Schema.Types.ObjectId>
) {
	const conditions = { active: true, _id: { $in: productIds } };
	const taskPromiseProduct = [];
	taskPromiseProduct.push(Product.find(conditions), Product.countDocuments(conditions));

	const [products, totalItems] = await Promise.all(taskPromiseProduct);

	let listProductId = _.map(products, getObjectId);
	listProductId = _.filter(listProductId);
	const taskPromiseSubProduct = listProductId.map(
		async (productId) => await getSubProductByProductId(productId)
	);
	const productSortByIds = map(productIds, (productId) => {
		return find(products, (product) => _.isEqual(productId, getObjectId(product)));
	});
	let subProducts = await Promise.all(taskPromiseSubProduct);
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

export async function updateGoogleTag(content: string) {
	const result = await Common.updateOne(
		{ type: CommonType.GOOGLE_TAG_SCRIPT },
		{ content: content }
	);
	if (!result.n) {
		const googleTagScript = new Common({
			type: CommonType.GOOGLE_TAG_SCRIPT,
			content: content,
		});
		await googleTagScript.save();
		return googleTagScript;
	}
	return result;
}

function handleMapSubProductWithProduct(subProducts, products) {
	const listProductSimilar = [];
	_.forEach(products, (product) => {
		const subProduct = subProducts.find((sub) => sub?.productId === product?._id + '');
		if (subProduct?.price) {
			listProductSimilar.push({
				...product?._doc,
				price: subProduct?.price || 0,
				productId: subProduct?.productId || product?._id,
			});
		}
	});
	return listProductSimilar;
}

export async function getSlogan() {
	const slogan = await Common.findOne({ type: CommonType.SLOGAN });
	if (!slogan) {
		const newSlogan = new Common({
			type: CommonType.SLOGAN,
			content:
				'園芸資材の最安値なら「AGRI PICK tools」「還元ポイント」や「送料」も込みで比較できる価格比較サイトです。',
		});
		return await newSlogan.save();
	}
	return slogan;
}

export async function getAFLink() {
	const afLink = await Common.findOne({ type: CommonType.AF_Link });
	if (!afLink) {
		const newAFLink = new Common({
			type: CommonType.AF_Link,
			value: { Rakuten: '', Amazon: '', Yahoo: '' },
		});
		return await newAFLink.save();
	}

	return afLink;
}

export async function updateAFLink(rakuten: string, amazon: string, yahoo: string) {
	const result = await Common.updateOne(
		{ type: CommonType.AF_Link },
		{
			value: {
				Rakuten: rakuten,
				Amazon: amazon,
				Yahoo: yahoo,
			},
		}
	);
	if (!result.n) {
		const common = new Common({
			type: CommonType.AF_Link,
			value: {
				Rakuten: rakuten,
				Amazon: amazon,
				Yahoo: yahoo,
			},
		});
		await common.save();
		return common;
	}
	return result;
}

export async function updateSlogan(content: string) {
	const result = await Common.updateOne({ type: CommonType.SLOGAN }, { content });
	if (!result.n) {
		const common = new Common({
			type: CommonType.SLOGAN,
			content,
		});
		await common.save();
		return common;
	}
	return result;
}

export async function getGoogleTagScript() {
	const script = await Common.findOne({ type: CommonType.GOOGLE_TAG_SCRIPT });
	if (!script) {
		const newScript = new Common({
			type: CommonType.GOOGLE_TAG_SCRIPT,
			content: '<script></script>',
		});
		return await newScript.save();
	}
	return script;
}
