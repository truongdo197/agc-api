import { ModelName, Sort } from '$enum/common';
import { IListAccount, IAccount, IDeleteAccount } from './account.interface';
import { returnPaging } from '$utils/utils';

import User from '$schema/User';
import { makeKeywordConditions } from '../../../../utils/utils';

export async function getAccountById(id: string) {
	const user = await User.findOne({ _id: id });
	return user;
}

export async function getDetailAccount(accountId: string) {
	return await User.findOne({ _id: accountId }).select('-password').populate('roleId', 'name');
}

export async function getAccountByEmail(email: string) {
	return await User.findOne({ email });
}

export async function getAccountByUsername(username: string) {
	return await User.findOne({ username });
}

export async function getAccountByPhone(mobile: string) {
	return await User.findOne({ mobile });
}

export async function getAccountByUsernameAndNotId(username: string, accountId: string) {
	return await User.findOne({ _id: { $ne: accountId }, username });
}

export async function getAccountByEmailAndNotId(email: string, accountId: string) {
	return await User.findOne({ _id: { $ne: accountId }, email });
}

export async function getAccountByPhoneAndNotId(mobile: string, accountId: string) {
	return await User.findOne({ _id: { $ne: accountId }, mobile });
}

export async function getListAccount(params: IListAccount) {
	const conditions = { active: true };
	if (params.keyword) {
		conditions['$or'] = [
			{ username: { $in: makeKeywordConditions(params.keyword) } },
			{ email: { $in: makeKeywordConditions(params.keyword) } },
			{ fullName: { $in: makeKeywordConditions(params.keyword) } },
			{ mobile: { $in: makeKeywordConditions(params.keyword) } },
		];
	}
	const data = await User.find(conditions)
		.select('-password')
		.populate('roleId', 'name')
		.populate(ModelName.ROLE, 'name')
		.limit(params.pageSize)
		.skip(params.start)
		.sort(params.sort);
	const totalItems = await User.countDocuments(conditions);
	return returnPaging(data, totalItems, params);
}

export async function addAccount(params: IAccount) {
	const user = new User({
		...params,
	});
	return await user.save();
}

export async function updateAccount(params) {
	return await User.updateOne({ _id: params.id }, params);
}

export async function deleteAccount(params: IDeleteAccount) {
	return await User.updateOne({ _id: params._id }, { active: false });
}
