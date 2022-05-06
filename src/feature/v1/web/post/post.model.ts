import { ParamsReturnPaging } from '$interface/Pagination.definition';
import Common from '$schema/Common';
import Post from '$schema/Post';
import Product from '$schema/Product';

import { getObjectId, returnPaging } from '$utils/utils';
import { slice } from 'lodash';
import { Schema } from 'mongoose';
import { PostType } from '../../../../types/enum/common';

export async function getPostSettingFromCommon(limit: number, type: number) {
	const data = await Common.findOne({ type }).populate({
		path: 'items',
		model: 'Post',
		select: 'title content image url',
		match: { active: true },
	});

	if (limit && data?.items?.length > limit) {
		const items = slice(data?.items, 0, limit);
		return items;
	}
	return data?.items;
}

export async function getListPostSimilar(params: ParamsReturnPaging) {
	const conditions = { active: true };
	if (params.categoryId) {
		conditions['category'] = getObjectId(params.categoryId);
	}
	if (params.tagId) {
		conditions['tag'] = getObjectId(params.tagId);
	}
	if (params.postType) {
		conditions['postType'] = Number(params.postType);
	}
	const data = await Post.find(conditions)
		.limit(params.pageSize)
		.skip(params.start)
		.sort(params.sort)
		.lean();
	const totalItems = await Post.countDocuments(conditions);
	return returnPaging(data, totalItems, params);
}

export async function getDetailPost(postId: string) {
	const data = await Post.findOne({ _id: getObjectId(postId), active: true })
		.populate('tag', 'name')
		.populate('category', 'name')
		.lean();
	return data;
}

export async function getListNewProductNews(params: ParamsReturnPaging) {
	const conditions = { active: true, postType: PostType.AGC_CONN };
	const posts = await Post.find(conditions)
		.limit(params.pageSize)
		.skip(params.start)
		.sort(params.sort);
	const totalItems = await Post.countDocuments(conditions);
	return returnPaging(posts, totalItems, params);
}

export async function getListPostSimilarProduct(
	params: ParamsReturnPaging,
	tagId: Schema.Types.ObjectId
) {
	const conditions = { active: true, tag: tagId };
	const data = await Post.find(conditions)
		.limit(params.pageSize)
		.skip(params.start)
		.sort(params.sort);
	const totalItems = await Post.countDocuments(conditions);
	return returnPaging(data, totalItems, params);
}

export async function getProductById(productId: string) {
	return await Product.findOne({ _id: getObjectId(productId) });
}
