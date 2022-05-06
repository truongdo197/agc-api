import mongoose, { Schema } from 'mongoose';
import { ModelName } from '$types/enum/common';
import { ISchemaTag } from './schemaInterface/tag.interface';

const schema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		image: String,
		category: { type: Schema.Types.ObjectId, ref: ModelName.CATEGORY },
		shortDescription: String,
		description: String,
		mappingAgripick: String,
	},
	{ timestamps: true }
);

const Tag = mongoose.model<ISchemaTag>(ModelName.TAG, schema);

export default Tag;
