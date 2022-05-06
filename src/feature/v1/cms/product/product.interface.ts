import { ISubProduct } from '$types/interface/Product.definition';
import { Schema } from 'mongoose';
export interface IListProduct {
	pageSize: number;
	pageIndex: number;
	start: number;
	keyword: string;
	category?: string;
}

export interface IAddProduct {
	product: {
		title: string;
		shortDescriptions: string[];
		longDescriptions: string[];
		tag: Schema.Types.ObjectId;
		images: string[];
		codes: Object[];
		thumbnail: string;
		similarProducts: Schema.Types.ObjectId[];
	};
	newSubProducts: Array<ISubProduct>;
	subProducts: string[];
}

export interface IUpdateProduct {
	id: string;
	title: string;
	shortDescriptions: string[];
	longDescriptions: string[];
	tag: Schema.Types.ObjectId;
	images: string[];
	codes: Object[];
	thumbnail: string;
	similarProducts: Array<string>;
}
