import Ranking from '$schema/Ranking';
import { ParamsReturnPaging } from '$types/interface/Pagination.definition';
import { returnPaging } from '$utils/utils';

export async function getListRanking(params: any) {
	const conditions = {};
	if (params.source) conditions['source'] = params.source;
	const data = await Ranking.aggregate([
		{
			$sort: {
				updatedAt: -1,
			},
		},
		{
			$match: conditions,
		},

		{
			$skip: params.start,
		},
		{
			$limit: params.pageSize,
		},
	]).allowDiskUse(true);
	const totalItems = await Ranking.countDocuments();
	return returnPaging(data, totalItems, params);
}

export async function addRanking(params: any) {
	const ranking = new Ranking({ ...params });
	await ranking.save();
}
