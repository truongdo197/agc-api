import mongoose, { Schema } from 'mongoose';
import { ISchemaProductNotiSetting } from './schemaInterface/productNotiSetting.interface';
import { ModelName } from '$enum/common';

const schema = new Schema(
	{
		product: { type: Schema.Types.ObjectId, ref: ModelName.PRODUCT },
		member: { type: Schema.Types.ObjectId, ref: ModelName.MEMBER },
		valueSetting: { type: Number, required: true },
		valueBeforeChange: {
			type: Number,
			required: true,
		},
		priceExcuted: Number,
		type: { type: String, required: true },
		active: { type: Boolean, default: false },
	},
	{ timestamps: true }
);
const ProductNotiSetting = mongoose.model<ISchemaProductNotiSetting>(
	ModelName.PRODUCT_NOTI_SETTING,
	schema
);

export default ProductNotiSetting;
