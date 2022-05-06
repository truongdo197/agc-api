import { StatusEntity } from '$enum/common';
import { Schema } from 'mongoose';

export interface IListMember {
	pageSize: number;
	pageIndex: number;
	start: number;
	sort: string;
	keyword: string;
}

export interface IMember {
	_id?: string;
	password?: string;
	fullName?: string;
	email?: string;
	avatar?: string;
}

export interface ILoginParams {
	email: string;
	password: string;
}
export interface IToken {
	token: string;
	refreshToken: string;
}
export interface ICheckVerifiedCodeParams {
	email: string;
	verifiedCode: string;
}

export interface IResetPasswordParams {
	newPassword: string;
	token: string;
}
