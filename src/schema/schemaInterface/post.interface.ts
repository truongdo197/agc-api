import { Document, Schema } from 'mongoose';

export interface ISchemaPost extends Document {
	title: string;
	image: string;
	content: string;
	status: number;
	postType: number;
	createdBy: Schema.Types.ObjectId;
	active: boolean;
	url: string;
	category: Schema.Types.ObjectId;
	tag: Schema.Types.ObjectId;
}
