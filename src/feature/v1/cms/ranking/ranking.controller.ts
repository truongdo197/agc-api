import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import { checkPermission, checkTokenCms } from '$middleware/cms.middleware';
import { Role } from '$enum/common';
import * as service from './ranking.service';
import { done, ErrorHandlerController } from '$utils/response';

const logger = log('Banner CMS controller');

@CmsController('/rankings')
export default class RankingController {
	@Get('/', [checkTokenCms, checkPermission([Role.USER, Role.BANNER, Role.ADMIN])])
	async getListBanner(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			if (query.typeBanner) query.typeBanner = Number(query.typeBanner);
			const data = await service.getListRanking(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/', [checkTokenCms, checkPermission([Role.USER, Role.BANNER, Role.ADMIN])])
	async createBanner(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			await service.createRanking(body);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/recrawl-ranking')
	async recrawlRanking(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await service.recrawlRanking();
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
