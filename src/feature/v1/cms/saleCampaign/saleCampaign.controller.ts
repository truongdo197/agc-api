import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './saleCampaign.service';
import { validate } from '$config/ajv';
import {
	createSaleCampaignSchema,
	listSaleCampaignSchema,
	updateSaleCampaignSchema,
} from './saleCampaign.validate';
import { ErrorCode, Role } from '$enum/common';
import { checkTokenCms, checkPermission } from '$middleware/cms.middleware';
import moment from 'moment';

const logger = log('Point CMS controller');

@CmsController('/sale-campaigns')
export default class SaleCampaignController {
	@Get('/')
	async getListSaleCampaign(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			validate(listSaleCampaignSchema, query);
			const data = await service.getListSaleCampaign(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/detail/:saleCampaignId')
	async getDetailSaleCampaign(req: Request, res: Response, next: NextFunction) {
		try {
			const saleCampaignId = req.params.saleCampaignId;
			const data = await service.getDetailSaleCampaign(saleCampaignId);
			if (!data) {
				throw ErrorCode.Not_Found;
			}
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/', [checkTokenCms, checkPermission([Role.ADMIN, Role.SALE])])
	async createSaleCampaign(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(createSaleCampaignSchema, body);
			const result = await service.createSaleCampaign(body);
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/:saleCampaignId', [checkTokenCms, checkPermission([Role.ADMIN, Role.SALE])])
	async updateSaleCampaign(req: Request, res: Response, next: NextFunction) {
		try {
			const saleCampaignId = req.params.saleCampaignId;
			const body = req.body;
			validate(updateSaleCampaignSchema, body);
			const { n } = await service.updateSaleCampaign(saleCampaignId, body);
			if (!n) throw ErrorCode.Not_Found;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Delete('/:saleCampaignId', [checkTokenCms, checkPermission([Role.ADMIN, Role.SALE])])
	async deleteSaleCampaign(req: Request, res: Response, next: NextFunction) {
		try {
			const saleCampaignId = req.params.saleCampaignId;
			const { n } = await service.deleteSaleCampaign(saleCampaignId);
			if (!n) throw ErrorCode.Not_Found;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
