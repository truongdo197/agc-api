import { Response, NextFunction, Request } from 'express';
import { done, ErrorHandlerController } from '$utils/response';
import log from '$config/log';
import { WebController, Get, Post, Put, Delete } from '$decorator/routeWeb.decorator';
import _, { has } from 'lodash';
import * as services from './saleCampaign.service';
import { setDataPaging } from '$utils/utils';
const logger = log('Category Web controller');

@WebController('/sale-campaigns')
export default class SaleCampaignController {
	@Get('/')
	async getListSaleCampaign(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const data = await services.getListSaleCampaign(params);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
