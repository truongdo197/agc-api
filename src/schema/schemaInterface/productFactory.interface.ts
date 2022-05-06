import { Document, Schema } from 'mongoose';

export interface ISchemaProductFactory extends Document {
	title: string;
	asinCode: string;
	janCode: string;
	urlProducts: Array<{ source: string; url: string, status: number }>;
	history: Array<{
		createdAt: Date | string;
		urlProduct: string;
		status: number;
	}>;
}
