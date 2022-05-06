import { ParamsReturnPaging } from '$interface/Pagination.definition';
import SaleCampaign from '$schema/SaleCampaign';
import moment from 'moment';
import { returnPaging } from '$utils/utils';
export async function getListSaleCampaign(params: ParamsReturnPaging) {
	const now = moment().toDate();
	const conditions = {
		active: true,
		endDate: { $gte: now },
		startDate: {
			$lte: now,
		},
	};
	const saleCampaigns = await SaleCampaign.find(conditions)
		.limit(params.pageSize)
		.skip(params.start)
		.sort(params.sort);
	const totalItems = await SaleCampaign.countDocuments(conditions);
	return returnPaging(saleCampaigns, totalItems, params);
}
