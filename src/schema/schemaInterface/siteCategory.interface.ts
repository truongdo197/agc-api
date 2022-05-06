import { Document, Schema } from 'mongoose';

export interface ISchemaSiteCategory extends Document {
	tag: Schema.Types.ObjectId;
	name: string;
	index: number;
	source: string;
}
