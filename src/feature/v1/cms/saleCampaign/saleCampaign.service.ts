import * as model from './saleCampaign.model';
import { IListSaleCampaign, ISaleCampaign } from './saleCampaign.interface';
import moment from 'moment';

export async function getListSaleCampaign(params: IListSaleCampaign) {
	return await model.getSaleCampaignList(params);
}

export async function getDetailSaleCampaign(saleCampaignId: string) {
	return await model.saleCampaignById(saleCampaignId);
}

export async function updateSaleCampaign(saleCampaignId: string, body: ISaleCampaign) {
	body.startDate = moment(body.startDate).startOf('day').toDate();
	body.endDate = moment(body.endDate).endOf('day').toDate();
	return await model.updateSaleCampaign(saleCampaignId, body);
}

export async function deleteSaleCampaign(saleCampaignId: string) {
	return model.deleteSaleCampaign(saleCampaignId);
}

export async function createSaleCampaign(body: ISaleCampaign) {
	body.startDate = moment(body.startDate).startOf('day').toDate();
	body.endDate = moment(body.endDate).endOf('day').toDate();
	return await model.createSaleCampaign(body);
}
