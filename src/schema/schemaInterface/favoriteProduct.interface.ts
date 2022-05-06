import { Document, Schema } from 'mongoose';

export interface ISchemaFavoriteProduct extends Document {
	product: Schema.Types.ObjectId;
	member: Schema.Types.ObjectId;
	createdAt?: Date | string;
	updatedAt?: Date | string;
}
