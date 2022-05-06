import { Response, NextFunction, Request } from 'express';
import { done, ErrorHandlerController } from '$utils/response';
import log from '$config/log';
import { WebController, Get } from '$decorator/routeWeb.decorator';
import * as services from './common.service';
const logger = log('Category Web controller');

@WebController('/commons')
export default class CategoryController {
	@Get('/slogan')
	async getCategoryList(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await services.getSlogan();
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/af-link')
	async getAFLink(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await services.getAFLink();
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/google-tag-script')
	async getGoogleTagScript(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await services.getGoogleTagScript();
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
