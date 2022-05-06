import mongoose, { Schema } from 'mongoose';
import { ModelName } from '$enum/common';
import { ISchemaProductHistory } from './schemaInterface/productHistory.interface';

const schema = new Schema(
	{
		product: { type: Schema.Types.ObjectId, ref: ModelName.PRODUCT },
		member: { type: Schema.Types.ObjectId, ref: ModelName.MEMBER },
	},
	{ timestamps: true }
);
const ProductHistory = mongoose.model<ISchemaProductHistory>(ModelName.PRODUCT_HISTORY, schema);

export default ProductHistory;
