import { Response, NextFunction, Request } from 'express';
import { WebController, Get } from '$decorator/routeWeb.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import log from '$config/log';
import * as service from './ranking.service';

const logger = log('Ranking Product Web controller');

@WebController('/rankings')
export default class RankingController {
	@Get('/parent-categories')
	async getListParentCategories(req: Request, res: Response, next: NextFunction) {
		try {
			const { source } = req.query;
			const data = await service.getParentCategories(source as string);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/detail')
	async getDetailRanking(req: Request, res: Response, next: NextFunction) {
		try {
			const { categoryId, source } = req.query;
			const data = await service.getDetailRanking(categoryId as string, source as string);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/detail-filter')
	async getDetailRankingFilter(req: Request, res: Response, next: NextFunction) {
		try {
			const params = req.query;
			const data = await service.getDetailRankingFilter(params);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
