import mongoose, { Schema } from 'mongoose';
import { ModelName } from '$types/enum/common';
import { ISchemaMember } from './schemaInterface/member.interface';

const schema = new Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		facebookId: { type: String },
		googleId: { type: String },
		avatar: String,
		password: String,
		email: { type: String, unique: true },
		refreshToken: String,
		active: { type: Boolean, default: true },
		resetToken: {
			value: String,
			expires: Date,
		},
	},
	{ timestamps: true }
);

schema.index({ email: 1 });
const Member = mongoose.model<ISchemaMember>(ModelName.MEMBER, schema);

export default Member;
