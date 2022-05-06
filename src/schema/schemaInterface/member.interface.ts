import { Document, Schema } from 'mongoose';

export interface ISchemaMember extends Document {
	email: string;
	password: string;
	resetToken: {
		value: string;
		expires: Date | string;
	};
	avatar?: string;
	facebookId?: string;
	googleId?: string;
	fullName: string;
	active: boolean;
	refreshToken: string;
}
