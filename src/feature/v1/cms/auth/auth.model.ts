import { VerifiedCodeStatus } from '$enum/common';
import env from '$config/env';
import moment from 'moment';
import { hash } from 'bcryptjs';
import VerifiedCode from '$schema/VerifiedCode';
import User from '$schema/User';

export async function getUserById(userId: string) {
	return await User.findOne({ _id: userId }).select('_id active email mobile');
}

export async function getUserPassword(userId: string) {
	return await User.findOne({ _id: userId });
}

export async function getUserByEmail(email: string) {
	return await User.findOne({ email });
}

export async function changePassword(userId: string, newHashPassword: string) {
	return await User.updateOne({ _id: userId }, { password: newHashPassword });
}

export async function getUserInfomation(userId: string) {
	return await User.findOne({ _id: userId }).populate('roleId', 'name');
}

export async function updateRefreshToken(userId: string, newRefreshToken: string) {
	return await User.updateOne({ _id: userId }, { refreshToken: newRefreshToken });
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
	return await User.updateOne({ _id: userId }, { password: passwordHash });
}
