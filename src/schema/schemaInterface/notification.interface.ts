import { Document, Schema } from 'mongoose';

export interface ISchemaNotification extends Document {
	product: Schema.Types.ObjectId;
	valueSetting: number;
	member: Schema.Types.ObjectId;
	content: string;
	title: string;
	isRead?: boolean;
	valueAfterChange: number;
}
