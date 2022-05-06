import * as model from './post.model';
import { CommonType, PostType } from '../../../../types/enum/common';
import { ParamsReturnPaging } from '$interface/Pagination.definition';
import { getObjectId } from '$utils/utils';

export async function getNewsListFromCommon(limit?: number) {
	return await model.getPostSettingFromCommon(limit, CommonType.NEWS);
}

export async function getNewProductNewsListFromCommon(limit: number) {
	return await model.getPostSettingFromCommon(limit, CommonType.NEW_PRODUCT);
}

export async function getListProductSimilar(params: ParamsReturnPaging) {
	return await model.getListPostSimilar(params);
}
export async function getListProductSimilarProduct(params: ParamsReturnPaging) {
	const product = await model.getProductById(params.productId);
	const tagId = getObjectId(product?.tag);
	return await model.getListPostSimilarProduct(params, tagId);
}

export async function getDetailPost(postId: string) {
	const post = await model.getDetailPost(postId);
	const postSimilars = await model.getListPostSimilar({
		categoryId: post.category,
		postType: PostType.AGC_CONN,
	});
	return { ...post, postSimilars };
}

export async function getListNewProductNews(params: ParamsReturnPaging) {
	return await model.getListNewProductNews(params);
}
