import mongoose, { Schema } from 'mongoose';
import { ModelName } from '$types/enum/common';
import { ISchemaSaleCampaign } from './schemaInterface/saleCampaign.interface';
import { SourceProduct } from '../types/enum/common';

const schema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		image: String,
		url: { type: String, required: true },
		startDate: { type: Date, required: true },
		endDate: { type: Date, required: true },
		active: { type: Boolean, default: true },
		discount: { type: String, required: true },
		source: { type: String, enum: Object.values(SourceProduct), required: true },
		store: { type: String, required: true },
	},
	{ timestamps: true }
);

const SaleCampaign = mongoose.model<ISchemaSaleCampaign>(ModelName.SALE_CAMPAIGN, schema);

export default SaleCampaign;
