import { PagingParams } from '$interface/Pagination.definition';
import { IListPoint, IPoint } from './point.interface';
import { returnPaging } from '$utils/utils';

import Point from '$schema/Point';
import { get } from 'lodash';
import { PointType } from '$enum/common';

export async function getPointById(id: string) {
	return await Point.findOne({ _id: id, active: true });
}

export async function getListPoint(params: IListPoint) {
	const conditions = { active: true };
	const data = await Point.find(conditions)
		.limit(params.pageSize)
		.skip(params.start)
		.sort(params.sort);
	const totalItems = await Point.countDocuments(conditions);
	return returnPaging(data, totalItems, params);
}

export async function addPoint(params: IPoint) {
	const point = new Point({ ...params });
	await point.save();
}

export async function updatePoint(params: IPoint) {
	return await Point.updateOne({ _id: params._id }, { ...params });
}

export async function deletePoint(id: string) {
	return await Point.updateOne({ _id: id, active: true }, { active: false });
}
