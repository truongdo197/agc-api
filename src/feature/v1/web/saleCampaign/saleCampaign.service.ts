import { ParamsReturnPaging } from '$types/interface/Pagination.definition';
import * as model from './saleCampaign.model';
export async function getListSaleCampaign(params: ParamsReturnPaging) {
	return await model.getListSaleCampaign(params);
}
