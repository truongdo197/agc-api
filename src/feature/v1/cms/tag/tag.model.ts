import Tag from '$schema/Tag';
import { ITag } from './tag.interface';
import { getObjectId, returnPaging } from '$utils/utils';
import { makeKeywordConditions } from '../../../../utils/utils';
import SiteCategory from '../../../../schema/SiteCategory';
import { SourceProduct, ModelName } from '../../../../types/enum/common';
import { flatten, map } from 'lodash';
import SubProduct from '$schema/SubProduct';
import Product from '$schema/Product';

export async function createTag(params: ITag) {
	const tag = new Tag(params);
	await SiteCategory.updateMany({ _id: { $in: params.siteCategories } }, { tag: tag._id });
	return await tag.save();
}

export async function getTagById(tagId: string) {
	const tag = await Tag.findOne({ _id: getObjectId(tagId) })
		.populate('category', 'name')
		.lean();
	const siteCategories = await SiteCategory.find({ tag: tag._id });
	return { ...tag, siteCategories };
}

export async function getTagList(params: ITag) {
	const conditions = {};
	if (params.category) {
		conditions['category'] = params.category;
	}
	if (params.keyword) {
		conditions['name'] = { $in: makeKeywordConditions(params.keyword) };
	}
	const totalItems = await Tag.countDocuments(conditions);
	const tags = await Tag.find(conditions)
		.populate('category', 'name')
		.limit(params.pageSize)
		.skip(params.start)
		.lean();
	const tagsWithSiteCatPromise = map(tags, async (tag) => {
		const siteCats = await SiteCategory.find({ tag: tag._id });
		return { ...tag, siteCategories: siteCats };
	});
	const tagsWithSiteCat = await Promise.all(tagsWithSiteCatPromise);
	return returnPaging(tagsWithSiteCat, totalItems, params);
}

export async function deleteTag(tagId: string) {
	return await Tag.deleteOne({ _id: getObjectId(tagId) });
}

export async function updateTag(tagId: string, params: ITag) {
	const tag = await Tag.findById(tagId);
	await SiteCategory.updateMany({ tag: tag._id }, { tag: null });
	await SiteCategory.updateMany(
		{ _id: { $in: params.siteCategories } },
		{ tag: getObjectId(tagId) }
	);
	const siteCats = await SiteCategory.find({ tag: getObjectId(tagId) }).select('name');

	const productsWithCategoriesName = await SubProduct.find({
		productId: { $ne: null },
		'categories.name': { $in: map(siteCats, 'name') },
	});
	await Product.updateMany(
		{ _id: { $in: map(productsWithCategoriesName, 'productId') } },
		{ tag: getObjectId(tag) }
	);
	return await Tag.updateOne({ _id: tagId }, { ...params });
}

export async function getListSiteCats(keyword: string) {
	const condition = {};
	if (keyword) {
		condition['name'] = { $in: makeKeywordConditions(keyword) };
	}
	const sitCatsPromise = map(Object.values(SourceProduct), (source) =>
		SiteCategory.find({ ...condition, source })
			.limit(30)
			.populate({
				path: 'tag',
				model: ModelName.TAG,
				populate: {
					path: 'category',
					model: ModelName.CATEGORY,
				},
			})
			.lean()
	);
	const siteCats = await Promise.all(sitCatsPromise);
	return flatten(siteCats);
}

export async function unlinkSiteCat(index: number) {
	return await SiteCategory.updateOne({ index }, { tag: null });
}

export const productsWithCategoryName = async () => {
	const productsWithCategoriesName = await SubProduct.aggregate()
		.match({ $or: [{ tag: { $exists: false } }, { tag: { $eq: null } }] })
		.unwind('$categories')
		.group({ _id: '$productId', categories: { $push: '$categories.name' } });
	return productsWithCategoriesName;
};
