import mongoose, { Model, Schema } from 'mongoose';
import { CodeType, ModelName } from '$enum/common';
import { ISchemaProduct } from './schemaInterface/product.interface';
import {
	detectPriceChange,
	nofiForSettingPercent,
	notiForSettingPrice,
} from '$feature/v1/web/productNotiSetting/productNotiSetting.service';
import { IProduct } from '$types/interface/Product.definition';

const schema = new Schema(
	{
		title: { type: String },
		longDescriptions: [
			{
				type: String,
			},
		],
		shortDescriptions: [
			{
				type: String,
			},
		],
		thumbnail: { type: 'string', required: true },
		codes: [
			{
				value: String,
				codeType: {
					type: String,
					enum: Object.values(CodeType),
				},
			},
		],
		favoriteNumber: { type: Number, default: 0 },
		active: { type: Boolean, default: true },
		images: [{ type: String }],
		views: { type: Number, default: 0 },
		tag: { type: Schema.Types.ObjectId, ref: ModelName.TAG },
		price: Number,
		reviews: { type: Number, default: 0 },
		comments: { type: Number, default: 0 },
		specification: { type: Object },
		similarProducts: {
			type: [
				{
					type: Schema.Types.ObjectId,
					ref: ModelName.PRODUCT,
				},
			],
			default: [],
		},
		sourceMinPrice: { type: String },
	},
	{ timestamps: true }
);

schema.pre('updateOne', async function (next) {
	await Promise.all([
		notiForSettingPrice(this as IProduct, next),
		nofiForSettingPercent(this as IProduct, next),
	]);
});

schema.pre('save', async function (next) {
	await Promise.all([
		notiForSettingPrice(this as IProduct, next),
		nofiForSettingPercent(this as IProduct, next),
	]);
});

schema.pre('save', async function (next) {
	await detectPriceChange(this as IProduct, next);
});

schema.pre('updateOne', async function (next) {
	await detectPriceChange(this as IProduct, next);
});
const Product = mongoose.model<ISchemaProduct>(ModelName.PRODUCT, schema);

export default Product;
