import { ModelName, Sort, VerifiedCodeStatus } from '$enum/common';
import { IListMember, IMember } from './member.interface';
import { getObjectId } from '$utils/utils';

import User from '$schema/User';
import Member from '$schema/Member';
import VerifiedCode from '$schema/VerifiedCode';
import moment from 'moment';
import env from '$config/env';
import { hash } from 'bcrypt';

export async function getMemberById(_id: string) {
	const member = await Member.findOne({ _id: getObjectId(_id) });
	return member;
}

export async function getDetailMember(id: string) {
	return await Member.findOne({ _id: id }).select('-password -resetToken -refreshToken');
}

export async function getMemberByEmail(email: string) {
	return await Member.findOne({ email });
}

export async function createVerifiedCode(email: string, code: string) {
	let verifiedCode = await VerifiedCode.findOne({ object: email });
	if (!verifiedCode) verifiedCode = new VerifiedCode();
	verifiedCode.object = email;
	verifiedCode.code = code;
	verifiedCode.status = VerifiedCodeStatus.UNUSED;
	verifiedCode.verifiedDate = null;
	verifiedCode.expiredDate = moment().add(env.auth.verifiedCodeExpired, 'seconds').toDate();
	return await verifiedCode.save();
}

export async function checkVerifiedCode(email: string, code: string) {
	return await VerifiedCode.findOne({
		object: email,
		code,
		status: VerifiedCodeStatus.UNUSED,
		expiredDate: { $gte: new Date() },
	});
}
export async function setVerifiedCodeUsed(email: string, code: string) {
	return await VerifiedCode.updateOne(
		{ object: email, code },
		{
			status: VerifiedCodeStatus.USED,
			verifiedDate: new Date(),
		}
	);
}

export async function updatePassword(userId: string, password: string) {
	const passwordHash = await hash(password, Number(env.auth.saltRounds));
	return await Member.updateOne({ _id: userId }, { password: passwordHash, resetToken: null });
}
