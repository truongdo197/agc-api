import * as model from './point.model';
import { IListPoint } from './point.interface';
import _ from 'lodash';

export async function getListPoint(params: IListPoint) {
	return await model.getListPoint(params);
}
