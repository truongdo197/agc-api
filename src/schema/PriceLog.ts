import mongoose, { Model, Schema } from 'mongoose';
import { ISchemaPriceLog } from './schemaInterface/priceLog.interface';
import { ModelName } from '$enum/common';

const schema = new Schema(
	{
		product: { type: Schema.Types.ObjectId, ref: ModelName.PRODUCT },
		oldPrice: Number,
		newPrice: Number,
		store: String,
		averagePrice: Number,
		storeUrl: String
	},
	{ timestamps: true }
);
const PriceLog = mongoose.model<ISchemaPriceLog>(ModelName.PRICE_LOG, schema);

export default PriceLog;
