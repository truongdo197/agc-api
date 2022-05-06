import Category from '$schema/Category';
import { getObjectId, returnPaging } from '$utils/utils';
import { ICategory } from './category.interface';
import { makeKeywordConditions } from '../../../../utils/utils';
import Tag from '$schema/Tag';
import { ErrorCode } from '$enum/common';
export async function createCategory(params: ICategory) {
	const category = new Category({ ...params });
	return await category.save();
}

export async function getCategoryList(params: ICategory) {
	const condition = {};
	if (params.keyword) {
		condition['name'] = { $in: makeKeywordConditions(params.keyword) };
	}
	const totalItems = await Category.countDocuments(condition);
	const categories = await Category.find(condition)
		.sort('-createdAt')
		.limit(params.pageSize)
		.skip(params.start)
		.lean();
	return returnPaging(categories, totalItems, params);
}

export async function deleteCategory(categoryId: string) {
	const tagsNumb = await Tag.count({ category: getObjectId(categoryId) });
	if (tagsNumb) {
		throw ErrorCode.Can_Not_Delete;
	}
	return await Category.deleteOne({ _id: getObjectId(categoryId) });
}

export async function updateCategory(categoryId: string, params: ICategory) {
	return await Category.updateOne({ _id: categoryId }, { ...params });
}

export async function getCategoryById(categoryId: string) {
	return await Category.findOne({ _id: getObjectId(categoryId) });
}
