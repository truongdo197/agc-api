import mongoose, { Schema } from 'mongoose';
import { ISchemaProductFactory } from './schemaInterface/productFactory.interface';
import {
	ModelName,
	ProductFactoryStatus,
	SourceProduct,
	UrlProductFactoryStatus,
} from '$enum/common';

const schema = new Schema(
	{
		title: { type: String, required: true },
		asinCode: { type: String },
		janCode: { type: String },
		urlProducts: [
			{
				source: { type: String, enum: Object.values(SourceProduct) },
				url: String,
				status: { type: Number, enum: Object.values(UrlProductFactoryStatus) },
			},
		],
		history: [
			{
				createdAt: Date,
				urlProduct: String,
				status: {
					type: Number,
					enum: Object.values(ProductFactoryStatus),
				},
			},
		],
	},
	{ timestamps: true }
);
const ProductFactory = mongoose.model<ISchemaProductFactory>(ModelName.PRODUCT_FACTORY, schema);

export default ProductFactory;
