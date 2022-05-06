import { PointType, StatusEntity } from '$enum/common';

export interface IListPoint {
	pageSize: number;
	pageIndex: number;
	start: number;
	sort: string;
}

export interface IPoint {
	_id?: string;
	title: string;
	content: string;
	source: string;
	rate: number;
	options: Array<{ title: string; rate: number }>;
	type: PointType;
}
