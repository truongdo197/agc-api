import { Response, NextFunction, Request } from 'express';
import { done, ErrorHandlerController } from '$utils/response';
import log from '$config/log';
import * as services from './metric.service';
import { CmsController, Get, Put } from '$decorator/routeCms.decorator';
import { crawlerMetricsSchema } from './metric.validate';
import { validate } from '$config/ajv';
import { setDataPaging } from '$utils/utils';

const logger = log('Metrics CMS controller');

@CmsController('/metrics')
export default class MetricController {
	@Get('/crawl-logs')
	async getCrawlerMetrics(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const result = await services.getCrawlLogs(params);
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
