import { Document, Schema } from 'mongoose';

export interface ISchemaProductHistory extends Document {
	product: Schema.Types.ObjectId;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	member: Schema.Types.ObjectId;
}
