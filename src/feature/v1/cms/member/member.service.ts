import { PagingParams } from '$interface/Pagination.definition';
import _ from 'lodash';
import Member from '$schema/Member';
import { returnPaging, makeKeywordConditions } from '$utils/utils';
import { getObjectId } from '$utils/utils';
import { hash } from 'bcrypt';
import env from '$config/env';
import { ErrorCode } from '$enum/common';
import WatchingList from '$schema/WatchingList';

interface IListMember extends PagingParams {
	keyword: string;
}
export async function getListMember(params: IListMember) {
	const conditions = {};
	if (params.keyword) {
		conditions['$or'] = [
			{ email: { $in: makeKeywordConditions(params.keyword) } },
			{ fullName: { $in: makeKeywordConditions(params.keyword) } },
		];
	}
	const data = await Member.find(conditions)
		.select('-password -refreshToken')
		.limit(params.pageSize)
		.skip(params.start)
		.sort(params.sort);
	const totalItems = await Member.countDocuments(conditions);
	return returnPaging(data, totalItems, params);
}

interface IMember {
	fullName: string;
	password: string;
	email: string;
}

export async function createMember(body: IMember) {
	await checkFieldExistCreate(body);
	const passwordHash = await hash(body.password, Number(env.auth.saltRounds));
	body.password = passwordHash;
	const member = new Member(body);
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
	return await Member.findOne({ email });
}
export async function updateMember(memberId: string, body: IMember) {
	return await Member.updateOne({ _id: memberId }, { ...body });
}

export async function deleteMember(memberId: string) {
	return await Member.deleteOne({ _id: getObjectId(memberId) });
}
export async function getDetailMember(memberId: string) {
	return await Member.findOne({ _id: getObjectId(memberId) }).select('-password -refreshToken');
}
