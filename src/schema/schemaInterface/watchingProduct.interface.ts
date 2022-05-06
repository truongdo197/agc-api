import { Document, Schema } from 'mongoose';

export interface ISchemaWatchingProduct extends Document {
	product: Schema.Types.ObjectId;
	watchingList: Schema.Types.ObjectId;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	member: string;
}
