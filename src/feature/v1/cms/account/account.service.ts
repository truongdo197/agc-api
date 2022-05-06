import * as model from './account.model';
import { ErrorCode } from '$enum/common';
import { compare, hash } from 'bcrypt';
import env from '$config/env';

import { IAccount, IListAccount, IDeleteAccount } from './account.interface';
import _ from 'lodash';

export async function getDetailAccount(accountId: string) {
	return await model.getDetailAccount(accountId);
}

export async function getListAccount(params: IListAccount) {
	return await model.getListAccount(params);
}

export async function addAccount(params: IAccount) {
	await checkFieldExistCreate(params);
	const passwordHash = await hash(params.password, Number(env.auth.saltRounds));
	params.password = passwordHash;
	return await model.addAccount(params);
}

export async function updateAccount(params: IAccount) {
	const hasAccountExist = await checkAccountExist(params.id);
	if (!hasAccountExist) throw ErrorCode.User_Not_Exist;
	await checkFiledExistUpdate(params);
	await model.updateAccount(params);
}

export async function deleteAccount(params: IDeleteAccount) {
	return await model.deleteAccount(params);
}

async function checkFieldExistCreate(params: IAccount) {
	const hasEmailExist = await checkEmailExist(params.email);
	if (hasEmailExist) throw ErrorCode.Email_Exist;

	const hasUserExist = await checkUsernameExist(params.username);
	if (hasUserExist) throw ErrorCode.User_Exist;
}

async function checkFiledExistUpdate(params: IAccount) {
	const hasEmailExist = await checkEmailExistAndNotByAccountId(params.email, params.id);
	if (hasEmailExist) throw ErrorCode.Email_Exist;

	const hasUserExist = await checkUsernameExistAndNotByAccountId(params.username, params.id);
	if (hasUserExist) throw ErrorCode.User_Exist;
}

async function checkAccountExist(accountId: string) {
	return await model.getAccountById(accountId);
}

async function checkEmailExist(email: string) {
	return await model.getAccountByEmail(email);
}

async function checkPhoneExist(mobile: string) {
	return await model.getAccountByPhone(mobile);
}

async function checkUsernameExist(username: string) {
	return await model.getAccountByUsername(username);
}

async function checkUsernameExistAndNotByAccountId(username: string, accountId: string) {
	return await model.getAccountByUsernameAndNotId(username, accountId);
}

async function checkEmailExistAndNotByAccountId(email: string, accountId: string) {
	return await model.getAccountByEmailAndNotId(email, accountId);
}
