import { PagingParams } from '$interface/Pagination.definition';
import { IBanner, IListBanner } from './banner.interface';
import { returnPaging, makeKeywordConditions } from '$utils/utils';

import Banner from '$schema/Banner';
import { BannerPosition, BannerType } from '$types/enum/common';
import { ParamsReturnPaging } from '$types/interface/Pagination.definition';

export async function getBannerById(id: string) {
	return await Banner.findOne({ _id: id });
}

export async function getListBanner(params: IListBanner) {
	const conditions = { active: true };
	if (params.typeBanner) conditions['typeBanner'] = params.typeBanner;
	const data = await Banner.find(conditions)
		.limit(params.pageSize)
		.skip(params.start)
		.sort(params.sort);
	const totalItems = await Banner.countDocuments(conditions);
	return returnPaging(data, totalItems, params);
}

export async function addBanner(params: IBanner) {
	const banner = new Banner({ ...params });
	await banner.save();
}

export async function updateBanner(params: IBanner) {
	return await Banner.updateOne({ _id: params._id }, params);
}

export async function deleteBanner(id: string) {
	return await Banner.updateOne({ _id: id, active: true }, { active: false });
}

export async function getListSponsorProduct(query: ParamsReturnPaging) {
	const conditions = {
		active: true,
		typeBanner: BannerType.SPONSOR_PRODUCT,
		position: BannerPosition.SPONSOR_PRODUCT,
	};
	if (query.keyword) {
		conditions['content'] = { $in: makeKeywordConditions(query.keyword) };
	}
	const data = await Banner.find(conditions)
		.sort('-updatedAt')
		.limit(query.pageSize)
		.skip(query.start);
	const totalItems = await Banner.countDocuments(conditions);
	return returnPaging(data, totalItems, query);
}
