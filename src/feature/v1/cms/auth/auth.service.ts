import {
	LoginParams,
	ChangePasswordParams,
	Token,
	CheckVerifiedCodeParams,
	ResetPasswordParams,
} from './auth.interface';
import * as model from './auth.model';
import { ErrorCode } from '$enum/common';
import mailTemplates from '$enum/mailTemplate';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import _ from 'lodash';
import env from '$config/env';
import { promisify } from 'util';
import to from 'await-to-js';
import sendMail from '$config/mailer';
import format from 'string-format';

const verifyAsync = promisify(verify) as any;

export async function login(params: LoginParams) {
	const { email, password } = params;
	const user = await model.getUserByEmail(email);
	if (!user) throw ErrorCode.Username_Not_Exist;
	if (!user.active) throw ErrorCode.User_Blocked;
	const isTruePassword = await compare(password, user.password);
	if (!isTruePassword) throw ErrorCode.Password_Not_True;
	const roleData = user.roles;
	const data = {
		...(await generateTokenCms(user)),
		roles: roleData,
	};
	return data;
}
export async function changePassword(userId: string, params: ChangePasswordParams) {
	const { oldPassword, newPassword } = params;
	if (oldPassword === newPassword) throw ErrorCode.Invalid_Input;
	const user = await model.getUserPassword(userId);
	const isTruePassword = await compare(oldPassword, user.password);
	if (!isTruePassword) throw ErrorCode.Password_Not_True;
	const passwordHash = await hash(newPassword, Number(env.auth.saltRounds));
	return await model.changePassword(userId, passwordHash);
}

export async function generateNewRefreshToken(userId: string, refreshToken: string) {
	const user = await model.getUserInfomation(userId);
	const [error] = await to(verifyAsync(refreshToken, env.auth.tokenRefreshCms));
	if (error) throw ErrorCode.Refresh_Token_Expire;
	return await generateTokenCms(user);
}
export async function generateTokenCms(user: any) {
	const objAuth = _.pick(user, ['_id', 'active', 'email', 'mobile', 'roles']);
	objAuth.roles = objAuth.roles;
	const token = sign(objAuth, env.auth.tokenCms, {
		algorithm: 'HS256',
		expiresIn: env.auth.tokenExpire,
	});
	const refreshToken = sign(objAuth, env.auth.tokenRefreshCms, {
		algorithm: 'HS256',
		expiresIn: env.auth.refreshExpire,
	});
	await model.updateRefreshToken(user.id, refreshToken);
	return {
		token,
		refreshToken,
	};
}

export async function requestVerifiedCode(email: string) {
	const user = await model.getUserByEmail(email);
	if (!user) throw ErrorCode.Email_Not_Exist;
	const code = `${Math.floor(100000 + Math.random() * 900000)}`;
	await model.createVerifiedCode(email, code);
	sendMail({
		to: email,
		title: mailTemplates.verifiedCode.title,
		content: format(mailTemplates.verifiedCode.content, { code }),
	});
	return;
}
export async function checkVerifiedCode(params: CheckVerifiedCodeParams) {
	const verifiedCode = await model.checkVerifiedCode(params.email, params.verifiedCode);
	return {
		isValid: !!verifiedCode,
	};
}
export async function resetPassword(params: ResetPasswordParams) {
	const verifiedCode = await model.checkVerifiedCode(params.email, params.verifiedCode);
	if (!verifiedCode) throw ErrorCode.Verified_Code_Not_Correct;
	const user = await model.getUserByEmail(params.email);
	const isOldPasswordEqualNewPassword = await compare(params.newPassword, user.password);
	if (isOldPasswordEqualNewPassword) throw ErrorCode.Old_Password_Equal_New_Password;
	if (!user) throw ErrorCode.User_Not_Exist;
	if (!user.active) throw ErrorCode.User_Blocked;
	await model.updatePassword(user._id, params.newPassword);
	await model.setVerifiedCodeUsed(params.email, params.verifiedCode);
}
