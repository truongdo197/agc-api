import { StatusEntity } from '$enum/common';
import { Schema } from 'mongoose';

export interface IListAccount {
	pageSize: number;
	pageIndex: number;
	start: number;
	sort: string;
	keyword: string;
}

export interface IAccount {
	id?: string;
	username: string;
	password?: string;
	fullName: string;
	email: string;
	mobile: string;
	avatar?: string;
	roles: string[];
}

export interface IDeleteAccount {
	_id?: string;
}
