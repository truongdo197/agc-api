import { CodeType, SourceProduct } from '../enum/common';
import { Schema } from 'mongoose';
export interface IProduct {
	_id?: Schema.Types.ObjectId;
	title?: string;
	longDescriptions?: string[];
	shortDescriptions?: string[];
	tag?: Schema.Types.ObjectId;
	deleted?: boolean;
	deletedAt?: string | Date;
	deletedBy?: number;
	image?: string;
	codes?: Object[];
	active?: boolean;
	price?: number;
	specification?: object;
	similarProducts?: Schema.Types.ObjectId[];
}

export interface ISubProduct {
	_id: Schema.Types.ObjectId;
	title: string;
	longDescriptions: string[];
	shortDescriptions: string[];
	code: {
		value: string;
		codeType: string;
	};
	productId: Schema.Types.ObjectId;
	createdBy: Schema.Types.ObjectId;
	price: number;
	images: string[];
	sku: string;
	source: string;
	urlProduct: string;
	store: string;
	reviews: any[];
	specification: object;
	active: boolean;
	url: string;
	status: number;
	discount: number;
	hasFee: boolean;
	categories: any[];
	reviewsSummary?: any;
}
