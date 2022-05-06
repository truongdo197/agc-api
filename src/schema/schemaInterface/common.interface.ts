import { Document, Schema } from 'mongoose';

export interface ISchemaCommon extends Document {
	type: number;
	items: Schema.Types.ObjectId[];
	url?: string;
	image?: string;
	content: string;
	value?: object;
}
