import { Response, NextFunction, Request } from 'express';
import { done, ErrorHandlerController } from '$utils/response';
import log from '$config/log';
import { CmsController, Get, Post } from '$decorator/routeCms.decorator';
import * as services from './elasticseach.service';
import { setDataPaging } from '$utils/utils';

const logger = log('Elasticsearch CMS controller');

@CmsController('/elasticsearch')
export default class ElasticsearchController {
	@Post('/bulk')
	async syncData(req: Request, res: Response, next: NextFunction) {
		try {
			await services.addJobMigrateMongoToElasticsearch();
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/metrics')
	async getMetrics(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await services.getMetric();
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/test')
	async test(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await services.getMinPriceOfProduct('5f76d2bdd626b0278c7886f9');
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/index/count')
	async getTotalItems(req: Request, res: Response, next: NextFunction) {
		try {
			const { name } = req.query;
			const data = await services.getTotalItems(name);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/index/document/exist/:id')
	async checkDocumentExist(req: Request, res: Response, next: NextFunction) {
		try {
			const id = req.params.id;
			const { name, type } = req.query;
			const data = await services.checkDocumentExist(
				JSON.stringify(name),
				JSON.stringify(type),
				id
			);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
