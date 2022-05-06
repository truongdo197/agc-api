import { Document, Schema } from 'mongoose';

export interface ISchemaUser extends Document {
	username: string;
	password: string;
	fullName: string;
	email: string;
	mobile: string;
	avatar: string;
	active: boolean;
	roles: string[];
	refreshToken: string;
}
