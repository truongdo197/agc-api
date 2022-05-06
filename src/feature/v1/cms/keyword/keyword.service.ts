import { PagingParams } from '$interface/Pagination.definition';
import _ from 'lodash';
import Member from '$schema/Member';
import { returnPaging, makeKeywordConditions } from '$utils/utils';
import { getObjectId } from '$utils/utils';
import { hash } from 'bcrypt';
import env from '$config/env';
import { ErrorCode } from '$enum/common';
import Keyword from '$schema/Keyword';

interface IListKeyword extends PagingParams {
	keyword: string;
}
export async function getListKeyword(params: IListKeyword) {
	const conditions = {};
	if (params.keyword) {
		conditions['keyword'] = { $in: makeKeywordConditions(params.keyword) };
	}
	const data = await Keyword.find(conditions)
		.select('keyword numbers')
		.limit(params.pageSize)
		.skip(params.start)
		.sort('-numbers');
	const totalItems = await Keyword.countDocuments(conditions);
	return returnPaging(data, totalItems, params);
}

interface IKeyword {
	keyword: string;
}

export async function createKeyword(body: IKeyword) {
	const keyword = new Keyword({ keyword: body.keyword });
	return await keyword.save();
}

export async function updateKeyword(keywordId: string, numbers: number) {
	return await Keyword.updateOne({ _id: keywordId }, { numbers: numbers });
}

export async function deleteKeyword(keywordId: string) {
	return await Keyword.deleteOne({ _id: getObjectId(keywordId) });
}
