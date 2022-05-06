import mongoose, { Schema } from 'mongoose';
import { ModelName } from '../types/enum/common';
import { ISchemaCodeMap } from './schemaInterface/codeMap.interface';

const schema = new Schema(
	{
		_id: String,
		ean: { type: String },
		upc: { type: String },
		asin: { type: String },
		isProcessed: { type: Boolean, default: false },
	},
	{ timestamps: true, _id: false }
);

const CodeMap = mongoose.model<ISchemaCodeMap>(ModelName.CODE_MAP, schema);

export default CodeMap;
