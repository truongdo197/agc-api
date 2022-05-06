import { Document, Schema } from 'mongoose';

export interface ISchemaPriceLog extends Document {
	product: Schema.Types.ObjectId;
	oldProduct: number;
	newProduct: number;
	createdAt: Date;
	store: string;
	storeUrl: string;
}
