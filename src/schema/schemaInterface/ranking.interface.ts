import { Document } from 'mongoose';
import { IProduct } from '../../types/interface/Product.definition';

export interface ISchemaRanking extends Document {
	parent_id: string;
	category_id: string;
	name: string;
	source: string;
	rate: number;
	url: string;
	ranking_products: any
}

interface IRankingProduct {
	title: String;
	price: number;
	rank: number;
	url: string;
	image: String;
}
