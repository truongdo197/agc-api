import mongoose, { Schema } from 'mongoose';
import { ModelName } from '$types/enum/common';
import { ISchemaSiteCategory } from './schemaInterface/siteCategory.interface';
import { SourceProduct } from '../types/enum/common';

const schema = new Schema(
	{
		tag: {
			type: Schema.Types.ObjectId,
			ref: ModelName.TAG,
		},
		name: { type: String, required: true },
		index: Number,
		source: { type: String, enum: Object.values(SourceProduct), required: true },
	},
	{ timestamps: true }
);

const SiteCategory = mongoose.model<ISchemaSiteCategory>(ModelName.SITE_CATEGORY, schema);

export default SiteCategory;
