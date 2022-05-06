import { ISaleCampaign, IListSaleCampaign } from './saleCampaign.interface';
import SaleCampaign from '$schema/SaleCampaign';
import { returnPaging } from '$utils/utils';
import { getObjectId, makeKeywordConditions } from '../../../../utils/utils';
export async function createSaleCampaign(body: ISaleCampaign) {
	const saleCampaign = new SaleCampaign(body);
	return await saleCampaign.save();
}

export async function updateSaleCampaign(saleCampaignId: string, body: ISaleCampaign) {
	return await SaleCampaign.updateOne({ _id: saleCampaignId, active: true }, { ...body });
}

export async function getSaleCampaignList(params: IListSaleCampaign) {
	const conditions = { active: true };
	if (params.keyword) {
		conditions['title'] = { $in: makeKeywordConditions(params.keyword) };
	}
	const dataPromise = SaleCampaign.find(conditions)
		.sort(params.sort)
		.limit(params.pageSize)
		.skip(params.start)
		.lean();
	const totalItemsPromise = SaleCampaign.countDocuments(conditions);
	const [saleCampaigns, totalItems] = await Promise.all([dataPromise, totalItemsPromise]);
	return returnPaging(saleCampaigns, totalItems, params);
}

export async function deleteSaleCampaign(saleCampaignId: string) {
	return await SaleCampaign.updateOne(
		{ _id: getObjectId(saleCampaignId), active: true },
		{ active: false }
	);
}

export async function saleCampaignById(saleCampaignId: string) {
	return await SaleCampaign.findOne({ _id: getObjectId(saleCampaignId), active: true });
}
