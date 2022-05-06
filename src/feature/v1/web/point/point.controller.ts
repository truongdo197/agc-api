import { Response, NextFunction, Request } from 'express';
import { WebController, Get } from '$decorator/routeWeb.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './point.service';
import { validate } from '$config/ajv';
import { listPointSchema } from './point.validate';

const logger = log('Point WEB controller');

@WebController('/points')
export default class PointController {
	@Get('/')
	async getListPoint(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			validate(listPointSchema, query);
			const data = await service.getListPoint(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
