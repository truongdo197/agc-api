import { Response, NextFunction, Request } from 'express';
import { done, ErrorHandlerController } from '$utils/response';
import log from '$config/log';
import { WebController, Get, Post, Put, Delete } from '$decorator/routeWeb.decorator';
import _, { has } from 'lodash';
import * as services from './category.service';
import { setDataPaging } from '$utils/utils';
const logger = log('Category Web controller');

@WebController('/category')
export default class CategoryController {
	@Get('/')
	async getCategoryList(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const data = await services.getCategoryList(params);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/:categoryId')
	async getCategoryById(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await services.getCategoryById(req.params.categoryId);
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
