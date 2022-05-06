import { PagingParams } from '$interface/Pagination.definition';
import * as model from './common.model';
import _ from 'lodash';
export async function getHotProductList() {
	return await model.getHotProductList();
}

export async function updateHotProductList(productIds: string[]) {
	return await model.updateHotProductList(productIds);
}

export async function updateAdvertisingProductList(productIds: Array<string>) {
	return await model.updateAdvertisingProductList(productIds);
}

export async function getSettingSponsorProductList() {
	return await model.getSettingSponsorProductList();
}

export async function updateSettingSponsorProduct(items: string[]) {
	return await model.updateSettingSponsorProduct(items);
}

export async function getAdvertisingProductList(params: PagingParams) {
	const productCodeIds = await model.getListProductCodeIdByCommonId();
	const sliceProductIds = _.slice(
		productCodeIds?.items,
		params.start,
		params.start + params.pageSize
	);
	return await model.getAdvertisingProductList(params, sliceProductIds);
}

export async function getNewsList() {
	return await model.getNewsCommon();
}

export async function getNewProductList() {
	return await model.getNewProductCommon();
}

export async function getSlogan() {
	return await model.getSlogan();
}

export async function getAFLink() {
	return await model.getAFLink();
}

export async function updateSlogan(content) {
	return await model.updateSlogan(content);
}

export async function updateAFLink(rakuten: string, amazon: string, yahoo: string) {
	return await model.updateAFLink(rakuten, amazon, yahoo);
}

export async function updateGoogleTagScript(content: string) {
	return await model.updateGoogleTag(content);
}

export async function getGoogleTagScript() {
	return await model.getGoogleTagScript();
}
