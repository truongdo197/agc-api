import mongoose, { Schema } from 'mongoose';
import { CommonType, PostType, PostStatus, ModelName } from '../types/enum/common';
import { ISchemaPost } from './schemaInterface/post.interface';

const schema = new Schema(
	{
		title: String,
		image: String,
		content: String,
		status: {
			type: Number,
			enum: Object.values(PostStatus), // 1: Mac dinh, 2: duoc chon
		},
		postType: {
			type: Number,
			enum: Object.values(PostType), //1: bai viet tu agriconnect, 2: bai viet tu agripick
		},
		url: String,
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: ModelName.USER,
		},
		active: {
			type: Boolean,
			default: true,
		},
		category: {
			type: Schema.Types.ObjectId,
			ref: ModelName.CATEGORY,
		},
		tag: {
			type: Schema.Types.ObjectId,
			ref: ModelName.TAG,
		},
	},
	{ timestamps: true }
);

const Common = mongoose.model<ISchemaPost>(ModelName.POST, schema);

export default Common;
