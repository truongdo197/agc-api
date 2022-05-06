import * as model from './point.model';
import { PagingParams } from '$interface/Pagination.definition';
import { IListPoint, IPoint } from './point.interface';
import _ from 'lodash';

export async function getListPoint(params: IListPoint) {
	return await model.getListPoint(params);
}

export async function addPoint(params: IPoint) {
	return await model.addPoint(params);
}

export async function updatePoint(params: IPoint) {
	return await model.updatePoint(params);
}

export async function deletePoint(id: string) {
	return model.deletePoint(id);
}
export async function getDetailPoint(pointId: string) {
	return model.getPointById(pointId);
}
