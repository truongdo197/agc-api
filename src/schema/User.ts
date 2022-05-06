import mongoose, { Schema } from 'mongoose';
import { ISchemaUser } from './schemaInterface/user.interface';
import { ModelName } from '$enum/common';
import { Role } from '../types/enum/common';

const schema = new Schema(
	{
		username: {
			type: String,
			required: true,
			minlength: 1,
			maxlength: 255,
			unique: true,
			text: true,
		},
		password: { type: String, required: true, minlength: 1 },
		fullName: { type: String, required: true, minlength: 1, maxlength: 255 },
		email: { type: String, required: true, minlength: 1, maxlength: 255, unique: true, text: true },
		mobile: { type: String, required: true, minlength: 1, maxlength: 255 },
		avatar: { type: String, required: false },
		active: { type: Boolean, default: true },
		roles: { type: [{ type: String, enum: Object.values(Role) }], default: [Role.USER] },

		refreshToken: { type: String, required: false },
	},
	{ timestamps: true }
);
const User = mongoose.model<ISchemaUser>(ModelName.USER, schema);

export default User;
