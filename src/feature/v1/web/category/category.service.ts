import { ICategory } from './category.interface';
import _ from 'lodash';
import * as model from './category.model';
import { getObjectId } from '$utils/utils';
export async function getCategoryList(params: ICategory) {
	return await model.getCategoryList(params);
}
export async function getCategoryById(categoryId: string) {
	let listTagIds = await model.getTagsByCategory(categoryId);
	listTagIds = _.map(listTagIds, getObjectId);
	const queryTotal = model.countProductsByCategory(listTagIds);
	const queryDetail = model.getCategoryById(categoryId);
	const taskPromise = [];
	taskPromise.push(queryTotal, queryDetail);
	const [totalItems, data] = await Promise.all(taskPromise);
	return {
		...JSON.parse(JSON.stringify(data)),
		totalProducts: totalItems,
	};
}
