import mongoose, { Schema } from 'mongoose';
import { ModelName } from '$enum/common';
import { ISchemaWatchingProduct } from './schemaInterface/watchingProduct.interface';

const schema = new Schema(
	{
		product: { type: Schema.Types.ObjectId, ref: ModelName.PRODUCT },
		watchingList: { type: Schema.Types.ObjectId, ref: ModelName.WATCHING_LIST },
		member: { type: Schema.Types.ObjectId, ref: ModelName.MEMBER },
	},
	{ timestamps: true }
);
const WatchingProduct = mongoose.model<ISchemaWatchingProduct>(ModelName.WATCHING_PRODUCT, schema);

export default WatchingProduct;
