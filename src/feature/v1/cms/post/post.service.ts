import { IPost, IPostList } from './post.interface';
import * as model from './post.model';
import { CommonType } from '../../../../types/enum/common';
import { getObjectId } from '../../../../utils/utils';
export async function createPost(body: IPost) {
	body.category = getObjectId(body.category);
	body.tag = getObjectId(body.tag);
	return await model.createPost(body);
}

export async function deletePost(_id: string) {
	return await model.deletePost(_id);
}

export async function getPostList(params: IPostList) {
	return await model.getPostList(params);
}

export async function chosenNews(postIds: string[]) {
	return await model.chosenNews(postIds, CommonType.NEWS);
}

export async function chosenNewProductNews(postIds: string[]) {
	return await model.chosenNews(postIds, CommonType.NEW_PRODUCT);
}

export async function updatePost(postId: string, params: IPost) {
	return await model.updatePost(postId, params);
}

export async function getDetailPost(postId: string) {
	return await model.getDetailPost(postId);
}
