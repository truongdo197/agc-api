import Tag from '$schema/Tag';
import { ITag } from './tag.interface';
import { getObjectId, returnPaging } from '$utils/utils';
import Product from '$schema/Product';
import _ from 'lodash';

export async function getTagById(tagId: string) {
	return await Tag.findOne({ _id: getObjectId(tagId) })
		.populate('category', 'name')
		.lean();
}

export async function getTagList(params: ITag) {
	const conditions = {};
	if (params.category) {
		conditions['category'] = params.category;
	}
	if (params.keyword) {
		conditions['name'] = new RegExp(params.keyword);
	}

	const totalItems = await Tag.countDocuments(conditions);
	const rawTags = await Tag.find(conditions)
		.populate('category', 'name')
		.limit(params.pageSize)
		.limit(params.start)
		.lean();
	const mapTagsPromise = _.map(rawTags, async (tag) => {
		const totalProducts = await countProductByTag(tag._id);
		return { ...tag, totalProducts };
	});
	const tags = await Promise.all(mapTagsPromise);
	return returnPaging(tags, totalItems, params);
}

export async function countProductByTag(tagId: string) {
	const counts = await Product.countDocuments({
		price: { $gt: 0 },
		tag: getObjectId(tagId),
		active: true,
	});
	return counts;
}
