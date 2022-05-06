import * as model from './banner.model';

import { IListBanner } from './banner.interface';
import _ from 'lodash';
import { ParamsReturnPaging } from '$types/interface/Pagination.definition';

export async function getListBanner(params: IListBanner) {
	return await model.getListBanner(params);
}

export async function getDeitalBanner(bannerId: string) {
	return await model.getBannerById(bannerId);
}

export async function getListSponsorProduct() {
	return await model.getListSponsorProduct();
}
