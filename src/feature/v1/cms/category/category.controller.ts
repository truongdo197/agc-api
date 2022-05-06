import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';

import log from '$config/log';
import * as service from './category.service';
import { Delete } from '../../../../decorator/routeCms.decorator';
import { ErrorCode } from '../../../../types/enum/common';
import { validate } from '../../../../config/ajv';
import { categorySchema } from './category.validate';
import { setDataPaging } from '../../../../utils/utils';
import { Role } from '$enum/common';
import { checkPermission, checkTokenCms } from '$middleware/cms.middleware';
const logger = log('Auth CMS controller');

@CmsController('/categories')
export default class CategoryController {
	@Get('/', [checkTokenCms, checkPermission([Role.ADMIN, Role.USER, Role.CATEGORY])])
	async getCategoryList(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const data = await service.getCategoryList(params);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Post('/', [checkTokenCms, checkPermission([Role.ADMIN, Role.USER, Role.CATEGORY])])
	async createCategory(req: Request, res: Response, next: NextFunction) {
		try {
			validate(categorySchema, req.body);
			const data = await service.createCategory(req.body);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Delete('/:categoryId', [checkTokenCms, checkPermission([Role.ADMIN, Role.USER, Role.CATEGORY])])
	async deleteCategory(req: Request, res: Response, next: NextFunction) {
		try {
			const { n } = await service.deleteCategory(req.params.categoryId);
			if (!n) throw ErrorCode.Not_Found;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/:categoryId', [checkTokenCms, checkPermission([Role.ADMIN, Role.USER, Role.CATEGORY])])
	async updateCategory(req: Request, res: Response, next: NextFunction) {
		try {
			validate(categorySchema, req.body);
			const { n } = await service.updateCategory(req.params.categoryId, req.body);
			if (!n) throw ErrorCode.Not_Found;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	
	@Get('/:categoryId', [checkTokenCms, checkPermission([Role.ADMIN, Role.USER, Role.CATEGORY])])
	async getCategoryById(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await service.getCategoryById(req.params.categoryId);
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
