import Category from '$schema/Category';
import Product from '$schema/Product';
import Tag from '$schema/Tag';
import { getObjectId, returnPaging } from '$utils/utils';
import { ICategory } from './category.interface';

export async function getCategoryList(params: ICategory) {
	const condition = { active: true };
	if (params.keyword) {
		condition['name'] = new RegExp(params.keyword);
	}
	const totalItems = await Category.countDocuments(condition);
	const categories = await Category.find(condition)
		.sort('-createdAt')
		.limit(params.pageSize)
		.skip(params.start)
		.lean();
	return returnPaging(categories, totalItems, params);
}

export async function getCategoryById(categoryId: string) {
	return await Category.findOne({ _id: getObjectId(categoryId) });
}

export async function getTagsByCategory(categoryId: string) {
	return await Tag.find({ category: getObjectId(categoryId) });
}
export async function countProductsByCategory(tagIds: Array<any>) {
	const counts = await Product.countDocuments({
		price: { $gt: 0 },

		tag: {
			$in: tagIds,
		},
		active: true,
	});

	return counts;
}
