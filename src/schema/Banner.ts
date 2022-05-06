import mongoose, { Schema } from 'mongoose';
import { BannerPosition, ModelName } from '../types/enum/common';
import { ISchemaBanner } from './schemaInterface/banner.interface';

const schema = new Schema(
	{
		typeBanner: { type: Number, required: true },
		url: { type: String },
		image: { type: String },
		content: { type: String, minlength: 1, maxlength: 5000 },
		active: { type: Boolean, default: true },
		price: { type: Number },
		position: { type: Number, enum: Object.values(BannerPosition) },
	},
	{ timestamps: true }
);

const Banner = mongoose.model<ISchemaBanner>(ModelName.BANNER, schema);

export default Banner;
