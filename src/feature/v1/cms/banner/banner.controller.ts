import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './banner.service';
import { validate } from '$config/ajv';
import {
	listBannerSchema,
	addBannerSchema,
	updateBannerSchema,
	deleteBannerSchema,
} from './banner.validate';
import { checkTokenCms, checkPermission } from '$middleware/cms.middleware';
import { ErrorCode, Role } from '$enum/common';

const logger = log('Banner CMS controller');

@CmsController('/banners')
export default class BannerController {
	@Get('/', [checkTokenCms, checkPermission([Role.USER, Role.BANNER, Role.ADMIN])])
	async getListBanner(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			if (query.typeBanner) query.typeBanner = Number(query.typeBanner);
			validate(listBannerSchema, query);
			const data = await service.getListBanner(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/sponsor-product', [checkTokenCms, checkPermission([Role.USER, Role.BANNER, Role.ADMIN])])
	async getListSponsorProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			const data = await service.getListSponsorProduct(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/:bannerId', [checkTokenCms, checkPermission([Role.USER, Role.BANNER, Role.ADMIN])])
	async getDetailAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const bannerId = req.params.bannerId;
			const data = await service.getDeitalBanner(bannerId);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/', [checkTokenCms, checkPermission([Role.USER, Role.BANNER, Role.ADMIN])])
	async createBanner(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(addBannerSchema, body);
			await service.createBanner(body);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/:bannerId', [checkTokenCms, checkPermission([Role.USER, Role.BANNER, Role.ADMIN])])
	async updateAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const bannerId = req.params.bannerId;
			const body = req.body;
			body._id = bannerId;
			validate(updateBannerSchema, body);
			const { n } = await service.updateBanner(body);
			if (!n) throw ErrorCode.Banner_Not_Exist;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Delete('/:bannerId', [checkTokenCms, checkPermission([Role.USER, Role.BANNER, Role.ADMIN])])
	async deleteAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const bannerId = req.params.bannerId;
			const body = { _id: bannerId };
			validate(deleteBannerSchema, body);
			const { n } = await service.deleteBanner(bannerId);
			if (!n) throw ErrorCode.Banner_Not_Exist;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
