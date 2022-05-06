import { IListPoint } from './point.interface';
import { returnPaging } from '$utils/utils';

import Point from '$schema/Point';

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
