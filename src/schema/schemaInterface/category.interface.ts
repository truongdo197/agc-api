import { Document } from 'mongoose';

export interface ISchemaCategory extends Document {
	name?: string;
	image?: string;
	shortDescription?: string,
	description?: string,
	active: boolean
}
