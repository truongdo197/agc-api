import { Document, Schema } from 'mongoose';

export interface ISchemaSubProduct extends Document {
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
	urlReview: string;
	rankingCategoryId: string;
	rankingName: string;
	rankingParentId: string;
	store: string;
	reviews: any[];
	feeText: string;
	specification: object;
	active: boolean;
	url: string;
	status: number;
	categories: object[];
	reviewsSummary: {
		total: number;
		avg: number;
	};
	hasFee: boolean;
	discount: number;
	isProcessedAsinCode: boolean;
	affiliateUrl: string;
	itemCode: string;
}
