import { StatusEntity } from '$enum/common';

export interface IListSaleCampaign {
	pageSize: number;
	pageIndex: number;
	start: number;
	sort: string;
	keyword: string;
}

export interface ISaleCampaign {
	title: string;
	image: string;
	url: string;
	startDate: Date;
	endDate: Date;
	store: string;
	discount: string;
	source: string;
}
