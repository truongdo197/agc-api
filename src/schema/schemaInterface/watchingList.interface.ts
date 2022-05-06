import { Document, Schema } from 'mongoose';

export interface ISchemaWatchingList extends Document {
	name: string;
	member: Schema.Types.ObjectId;
	count: number;
	createdAt?: Date | string;
	updatedAt?: Date | string;
}
