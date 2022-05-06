import { ISubProduct } from '$types/interface/Product.definition';
export interface IRanking {
	parent_id: string;
	category_id: string;
	source: string;
	rate: number;
	url: string;
	ranking_products: Array<IRankingProduct>;
}

interface IRankingProduct {
	title: String;
	price: number;
	rank: number;
	url: string;
	image: String;
}
