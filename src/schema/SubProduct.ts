import mongoose, { Schema } from 'mongoose';
import { CodeType, SourceProduct, ModelName, SubProductStatus } from '../types/enum/common';
import { ISchemaSubProduct } from './schemaInterface/subProduct.interface';

const schema = new Schema(
	{
		title: {
			type: String,
		},
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
		code: {
			type: {
				value: String,
				codeType: {
					type: String,
					enum: Object.values(CodeType),
				},
			},
			required: true,
		},
		price: { type: Number, required: true },
		urlReview: String,
		urlProduct: { type: String, required: true },
		source: {
			type: String,
			enum: Object.values(SourceProduct),
			required: true,
		},
		reviews: [
			{
				username: String,
				title: String,
				content: String,
				avatarUrl: String,
				helpfulRating: Number,
				createdAt: Date,
			},
		],
		specification: { type: Object },
		images: [{ type: String }],
		sku: { type: String },
		productId: { type: Schema.Types.ObjectId, ref: ModelName.PRODUCT },
		store: { type: String },
		active: { type: Boolean, default: true },
		status: { type: Number, enum: Object.values(SubProductStatus) },
		reviewsSummary: {
			total: Number,
			avg: Number,
		},
		discount: Number,
		hasFee: Boolean,
		feeText: String,
		isProcessedAsinCode: { type: Boolean, default: false },
		categories: { type: [{ url: String, name: String, index: Number }], minlength: 1 },
		rankingCategoryId: { type: String },
		rankingName: { type: String },
		rankingParentId: { type: String },
		affiliateUrl: { type: String },
		itemCode: { type: String },
	},
	{ timestamps: true }
);

const SubProduct = mongoose.model<ISchemaSubProduct>(ModelName.SUB_PRODUCT, schema);

export default SubProduct;
