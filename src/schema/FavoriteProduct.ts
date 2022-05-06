import mongoose, { Schema } from 'mongoose';
import { ModelName } from '$enum/common';
import { ISchemaFavoriteProduct } from './schemaInterface/favoriteProduct.interface';

const schema = new Schema(
	{
		product: { type: Schema.Types.ObjectId, ref: ModelName.PRODUCT },
		member: { type: Schema.Types.ObjectId, ref: ModelName.MEMBER },
	},
	{ timestamps: true }
);
const FavoriteProduct = mongoose.model<ISchemaFavoriteProduct>(ModelName.FAVORITE_PRODUCT, schema);

export default FavoriteProduct;
