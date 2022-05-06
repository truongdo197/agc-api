import * as model from './banner.model';
import { ErrorCode } from '$enum/common';

import { IListBanner, IBanner } from './banner.interface';
import _ from 'lodash';
import { ParamsReturnPaging } from '$types/interface/Pagination.definition';

export async function getListBanner(params: IListBanner) {
	return await model.getListBanner(params);
}

export async function getDeitalBanner(bannerId: string) {
	return await model.getBannerById(bannerId);
}

export async function createBanner(params: IBanner) {
	return await model.addBanner(params);
}

export async function updateBanner(params: IBanner) {
	return await model.updateBanner(params);
}

export async function deleteBanner(bannerId: string) {
	return await model.deleteBanner(bannerId);
}

export async function getListSponsorProduct(query: ParamsReturnPaging) {
	return await model.getListSponsorProduct(query);
}
