import { IListBanner } from './banner.interface';
import { returnPaging } from '$utils/utils';

import Banner from '$schema/Banner';
import { ParamsReturnPaging } from '$types/interface/Pagination.definition';
import { BannerType, BannerPosition } from '$types/enum/common';
import Common from '../../../../schema/Common';
import { CommonType } from '$enum/common';

export async function getBannerById(id: string) {
	return await Banner.findOne({ _id: id });
}

export async function getListBanner(params: IListBanner) {
	const conditions = { active: true };
	if (params.typeBanner) conditions['typeBanner'] = params.typeBanner;
	if (params.position) conditions['position'] = params.position;
	const data = await Banner.find(conditions)
		.limit(params.pageSize)
		.skip(params.start)
		.sort(params.sort);
	const totalItems = await Banner.countDocuments(conditions);
	return returnPaging(data, totalItems, params);
}

export async function getListSponsorProduct() {
	const common = await Common.findOne({ type: CommonType.SPONSOR_PRODUCT }).populate({
		path: 'items',
		match: { active: true },
		model: 'Banner',
	});
	if (!common) {
		const newCommon = new Common({ type: CommonType.SPONSOR_PRODUCT, items: [] });
		return await newCommon.save();
	}
	return common.items;
}
