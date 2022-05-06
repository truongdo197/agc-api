import { Schema } from 'mongoose';

export interface ISubProduct {
	_id: string;
	title: string;
	shortDescriptions: Array<string>;
	longDescriptions: Array<string>;
	code: object;
	images?: Array<string>;
	active: boolean;
	hasFee: boolean;
	sku: string;
	store: string;
	price: number | string;
	status?: number;
	categories: Array<object>;
	source: string;
	urlProduct: string;
	point: number;
	createdAt: string;
	productId: any;
	comments: number;
	reviewsAvg: number;
}

export interface IMetric {
	_id?: Schema.Types.ObjectId;
	totalProductsMongo: number;
	totalSubProductsMongo: number;
	totalSubProductsElasicsearch: number;
}
