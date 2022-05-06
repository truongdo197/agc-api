import mongoose, { Schema } from 'mongoose';
import { ISchemaNotification } from './schemaInterface/notification.interface';
import { ModelName } from '$enum/common';

const schema = new Schema(
	{
		product: { type: Schema.Types.ObjectId, ref: ModelName.PRODUCT },
		valueSetting: Number,
		valueAfterChange: Number,
		member: { type: Schema.Types.ObjectId, ref: ModelName.MEMBER },
		content: { type: String, required: true },
		title: { type: String, required: true },
		isRead: { type: Boolean, default: false },
	},
	{ timestamps: true }
);
const Notification = mongoose.model<ISchemaNotification>(ModelName.NOTIFICATION, schema);

export default Notification;
