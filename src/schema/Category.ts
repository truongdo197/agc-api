import mongoose, { Schema } from 'mongoose';
import { ModelName } from '$types/enum/common';
import { ISchemaCategory } from '$schema/schemaInterface/category.interface';

const schema = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		image: String,
		shortDescription: String,
		description: String,
		mappingAgripick: String,
		active: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

const Category = mongoose.model<ISchemaCategory>(ModelName.CATEGORY, schema);

export default Category;
