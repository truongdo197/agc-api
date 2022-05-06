import { Document, Schema } from 'mongoose';

export interface ISchemaTag extends Document {
	name?: string;
	image?: string;
	category: Schema.Types.ObjectId;
	description?: string, 
	shortDescription?: string
}
