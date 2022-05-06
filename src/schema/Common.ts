import mongoose, { Schema } from 'mongoose';
import { CommonType, ModelName } from '../types/enum/common';

import { ISchemaCommon } from './schemaInterface/common.interface';

const schema = new Schema(
	{
		type: {
			type: Number,
			required: true,
			enum: Object.values(CommonType),
		},
		content: String,
		items: [{ type: Schema.Types.ObjectId }],
		url: String,
		image: String,
		value: { type: Object },
	},
	{ timestamps: true }
);

const Common = mongoose.model<ISchemaCommon>(ModelName.COMMON, schema);

export default Common;
