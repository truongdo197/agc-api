export interface IListBanner {
	pageSize: number;
	pageIndex: number;
	start: number;
	sort: string;
	typeBanner: number;
}

export interface IBanner {
	_id?: string;
	typeBanner: number;
	price: number;
	url: string;
	content: string;
	image: string;
}
