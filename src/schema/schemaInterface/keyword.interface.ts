import { Document } from 'mongoose';

export interface ISchemaKeyword extends Document {
	keyword: string;
	numbers: number;
	createdAt: Date;
	updatedAt: Date;
}
