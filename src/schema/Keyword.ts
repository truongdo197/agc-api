import mongoose, { Schema } from 'mongoose';
import { ModelName } from '../types/enum/common';
import { ISchemaKeyword } from './schemaInterface/keyword.interface';

const schema = new Schema(
	{
		keyword: {
			type: String,
			required: true,
			unique: true,
		},
		numbers: { type: Number, default: 1 },
	},
	{ timestamps: true }
);

schema.index({ keyword: 1 });

const Keyword = mongoose.model<ISchemaKeyword>(ModelName.KEYWORD, schema);

export default Keyword;
