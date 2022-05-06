import * as model from './ranking.model';

export async function getParentCategories(source: string) {
	return await model.getParentCategories(source);
}

export async function getDetailRanking(categoryId?: string, source?: string) {
	return await model.getDetailRanking(categoryId, source);
}
export async function getDetailRankingFilter(params) {
	return await model.getDetailRankingFilter(params);
}
