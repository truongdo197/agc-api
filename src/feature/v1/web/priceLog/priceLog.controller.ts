import { Response, NextFunction, Request } from 'express';
import { WebController, Get, Post } from '$decorator/routeWeb.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './priceLog.service';

import { checkTokenWeb } from '$middleware/web.middleware';

const logger = log('Price Log WEB controller');

@WebController('/price-logs')
export default class PriceLogsController {
	@Get('/graph/:productId')
	async getPriceLogs(req: Request, res: Response, next: NextFunction) {
		try {
			const productId = req.params.productId;
			const range = req.query.range;
			const priceLogs = await service.getPriceLogs(productId, range as string);
			return done(res, priceLogs);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
