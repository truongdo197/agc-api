export interface IListProduct {
	pageSize: number;
	pageIndex: number;
	start: number;
	keyword: string;
	category?: string;
	tags?: Array<any>;
	memberId?: string;
	filter?: any;
	sort?: string;
}
