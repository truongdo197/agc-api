import { Document, Schema } from 'mongoose';

export interface ISchemaProduct extends Document {
	title: string;
	longDescriptions: string[];
	shortDescriptions: string[];
	tag: Schema.Types.ObjectId;
	codes: Array<object>;
	active: boolean;
	images: string[];
	views: number;
	thumbnail: string;
	price: number;
	specification: object;
	favoriteNumber: number;
	similarProducts: Schema.Types.ObjectId[];
	sourceMinPrice: string;
}
