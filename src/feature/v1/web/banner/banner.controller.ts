import { Response, NextFunction, Request } from 'express';
import { WebController, Get } from '$decorator/routeWeb.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './banner.service';
import { validate } from '$config/ajv';
import { listBannerSchema } from './banner.validate';

const logger = log('Banner Web controller');

@WebController('/banners')
export default class BannerController {
	@Get('/')
	async getListBanner(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			if (query.typeBanner) query.typeBanner = Number(query.typeBanner);
			if (query.position) query.position = Number(query.position);
			validate(listBannerSchema, query);
			const data = await service.getListBanner(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/sponsor-product')
	async getListSponsorProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await service.getListSponsorProduct();
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
