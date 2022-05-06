import * as model from './member.model';
import { ErrorCode } from '$enum/common';
import { compare, hash } from 'bcrypt';
import env from '$config/env';

import {
	IMember,
	ILoginParams,
	ICheckVerifiedCodeParams,
	IResetPasswordParams,
} from './member.interface';
import _ from 'lodash';
import Member from '$schema/Member';
import { sign, verify } from 'jsonwebtoken';
import { getObjectId } from '$utils/utils';
import sendMail from '$config/mailer';
import { promisify } from 'util';
import moment from 'moment';
import WatchingList from '$schema/WatchingList';
const verifyAsync = promisify(verify) as any;

export async function getDetailMember(memberId: string) {
	return await model.getDetailMember(memberId);
}

export async function addMember(params: IMember) {
	await checkFieldExistCreate(params);
	const passwordHash = await hash(params.password, Number(env.auth.saltRounds));
	params.password = passwordHash;
	const member = new Member(params);
	const watchingLists = [
		{ name: 'お気に入り', member: member._id },
		{ name: '保存と比較', member: member._id },
		{ name: '新規作成', member: member._id },
	];
	await WatchingList.insertMany(watchingLists);
	return await member.save();
}

async function checkFieldExistCreate(params: IMember) {
	const hasEmailExist = await checkEmailExist(params.email);
	if (hasEmailExist) throw ErrorCode.Email_Exist;
}

async function checkEmailExist(email: string) {
	return await model.getMemberByEmail(email);
}

export async function signIn(params: ILoginParams) {
	const { email, password } = params;
	const member = await model.getMemberByEmail(email);
	if (!member) throw ErrorCode.Member_Not_Exist;
	if (!member.active) throw ErrorCode.Member_Blocked;
	const isTruePassword = await compare(password, member.password);
	if (!isTruePassword) throw ErrorCode.Password_Not_True;
	const data = {
		fullName: member.fullName,
		email: member.email,
		_id: member._id,
		...(await generateTokenWeb(member)),
	};
	return data;
}

export async function generateTokenWeb(member: IMember) {
	const objAuth = _.pick(member, ['_id', 'active', 'email', 'fullName']);
	const token = sign(objAuth, env.auth.tokenWeb, {
		algorithm: 'HS256',
		expiresIn: env.auth.tokenExpire,
	});
	const refreshToken = sign(objAuth, env.auth.tokenRefreshWeb, {
		algorithm: 'HS256',
		expiresIn: env.auth.refreshExpire,
	});
	await Member.updateOne({ _id: getObjectId(member._id) }, { refreshToken });
	return {
		token,
		refreshToken,
	};
}

export async function sendMailResetPassword(email: string) {
	const member = await model.getMemberByEmail(email);
	if (!member) throw ErrorCode.Email_Not_Exist;
	const token = sign({ email, _id: member._id }, env.auth.tokenWeb, {
		algorithm: 'HS256',
		expiresIn: 10 * 60,
	});
	member.resetToken = { value: token, expires: moment().add(10, 'minute').toDate() };
	await member.save();
	sendMail({
		to: email,
		title: 'Reset Password Link',
		content: `Reset password: <a href="${env.webDomain}/?r=true&token=${token}">Click Here</a>`,
	});
	return;
}

export async function checkResetTokenExists(token) {
	const tokenExist = await Member.findOne({
		'resetToken.value': token,
		'resetToken.expires': { $gte: moment().toDate() },
	});
	return !!tokenExist;
}
export async function resetPassword(body: IResetPasswordParams) {
	const tokenDecoded = await verifyAsync(body.token, env.auth.tokenWeb);
	const email = tokenDecoded.email;
	const member = await Member.findOne({ email });
	const isOldPasswordEqualNewPassword = await compare(body.newPassword, member.password);
	if (isOldPasswordEqualNewPassword) throw ErrorCode.Old_Password_Equal_New_Password;
	if (!member) throw ErrorCode.Email_Not_Exist;
	return await model.updatePassword(member._id, body.newPassword);
}

export async function changePassword(memberId: string, newPassword: string, oldPassword: string) {
	const member = await Member.findById(memberId);
	const isWrongOldPassword = await compare(oldPassword, member.password);
	if (!isWrongOldPassword) throw ErrorCode.Password_Not_True;
	const isOldPasswordEqualNewPassword = await compare(newPassword, member.password);
	if (isOldPasswordEqualNewPassword) throw ErrorCode.Old_Password_Equal_New_Password;
	return await model.updatePassword(memberId, newPassword);
}

export async function updateProfile(memberId: string, body: IMember) {
	return await Member.updateOne(
		{ _id: getObjectId(memberId) },
		{
			$set: {
				...body,
			},
		}
	);
}

interface ISocialLogin {
	id: string;
	email?: string;
	image?: string;
	name?: string;
	provider: String;
}
export async function socialAuth(body: ISocialLogin) {
	let conditions = {};
	body.provider === 'facebook'
		? (conditions['facebookId'] = body.id)
		: (conditions['googleId'] = body.id);

	if (body.email) {
		conditions['email'] = body.email;
		delete conditions['facebookId'];
		delete conditions['googleId'];
	}

	const memberExisted = await Member.findOne(conditions);
	if (memberExisted) {
		memberExisted.facebookId = body.provider === 'facebook' ? body.id : null;
		memberExisted.googleId = body.provider === 'google' ? body.id : null;
		memberExisted.avatar ? body.image : null;
		await memberExisted.save();
		const response = {
			fullName: memberExisted.fullName,
			email: memberExisted.email,
			_id: memberExisted._id,
			...(await generateTokenWeb(memberExisted)),
		};
		return response;
	}

	const member = new Member({
		fullName: body.name,
		facebookId: body.provider === 'facebook' ? body.id : undefined,
		googleId: body.provider === 'google' ? body.id : undefined,
		avatar: body.image,
		email: body.email,
	});
	await member.save();
	const response = {
		fullName: member.fullName,
		email: member.email,
		_id: member._id,
		...(await generateTokenWeb(member)),
	};
	return response;
}
