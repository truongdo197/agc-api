import Post from '$schema/Post';
import { IPost, IPostList } from './post.interface';
import { returnPaging } from '$utils/utils';
import { getObjectId } from '$utils/utils';
import { map } from 'lodash';
import Common from '$schema/Common';
import { makeKeywordConditions } from '../../../../utils/utils';
export async function createPost(body: IPost) {
	const post = new Post({ ...body });
	return await post.save();
}

export async function deletePost(_id: string) {
	return await Post.updateOne({ _id: getObjectId(_id) }, { active: false });
}

export async function chosenNews(postIds: string[], type: number) {
	const result = await Common.updateOne(
		{ type },
		{ items: map(postIds, (postId) => getObjectId(postId)) }
	);
	if (!result.n) {
		const newsCommon = new Common({ type, items: map(postIds, (postId) => getObjectId(postId)) });
		await newsCommon.save();
		return newsCommon;
	}
	return result;
}

export async function getPostList(params: IPostList) {
	const condition = { active: true };
	if (params.keyword) {
		condition['title'] = { $in: makeKeywordConditions(params.keyword) };
	}
	if (params.type) {
		condition['postType'] = params.type;
	}
	const data = await Post.find(condition)
		.select('title content image postType createdBy tag category')
		.populate('tag', 'name')
		.populate('category', 'name')
		.populate('createdBy', 'fullName')
		.sort('-createdAt')
		.limit(params.pageSize)
		.skip(params.start);

	const totalItems = await Post.countDocuments(condition);

	return returnPaging(data, totalItems, params);
}

export async function updatePost(postId: string, params: IPost) {
	return await Post.updateOne({ _id: getObjectId(postId) }, { ...params });
}

export async function getDetailPost(postId: string) {
	return await Post.findById(getObjectId(postId))
		.populate('tag', 'name')
		.populate('category', 'name');
}
