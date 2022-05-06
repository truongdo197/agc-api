export interface PagingParams {
	pageIndex?: number;
	pageSize?: number;
	start?: number;
	sort?: string
}

export interface ParamsReturnPaging {
	pageIndex?: number;
	pageSize?: number;
	[key: string]: any;
}
