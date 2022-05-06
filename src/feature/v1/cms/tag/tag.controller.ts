import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';

import log from '$config/log';
import * as service from './tag.service';
import { validate } from '$config/ajv';
import { tagSchema } from './tag.validate';
import { ErrorCode } from '../../../../types/enum/common';
import { setDataPaging } from '../../../../utils/utils';
import { Role } from '$enum/common';
import { checkPermission } from '../../../../middleware/cms.middleware';
import { checkTokenCms } from '$middleware/cms.middleware';
import { getSiteCatsBySubProduct } from '$feature/v1/cms/category/category.service';
const logger = log('Auth CMS controller');

@CmsController('/tags')
export default class TagController {
	@Post('/', [checkTokenCms, checkPermission([Role.USER, Role.CATEGORY, Role.ADMIN])])
	async createTag(req: Request, res: Response, next: NextFunction) {
		try {
			validate(tagSchema, req.body);
			const data = await service.createTag(req.body);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/', [checkTokenCms, checkPermission([Role.USER, Role.CATEGORY, Role.ADMIN])])
	async getTagList(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const result = await service.getTagList(params);
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/site-cats', [checkTokenCms, checkPermission([Role.USER, Role.CATEGORY, Role.ADMIN])])
	async getListSiteCats(req: Request, res: Response, next: NextFunction) {
		try {
			const keyword = req.query.keyword;
			const result = await service.getListSiteCats(keyword as string);
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/sync-tag', [checkTokenCms, checkPermission([Role.USER, Role.CATEGORY, Role.ADMIN])])
	async syncTag(req: Request, res: Response, next: NextFunction) {
		try {
			await getSiteCatsBySubProduct()
			service.synchronizeTag();
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/site-cats/unlink', [
		checkTokenCms,
		checkPermission([Role.USER, Role.CATEGORY, Role.ADMIN]),
	])
	async unlinkSiteCat(req: Request, res: Response, next: NextFunction) {
		try {
			const index = Number(req.body.index);
			await service.unlinkSiteCat(index);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Delete('/:tagId', [checkTokenCms, checkPermission([Role.USER, Role.CATEGORY, Role.ADMIN])])
	async deleteTag(req: Request, res: Response, next: NextFunction) {
		try {
			const { n } = await service.deleteTag(req.params.tagId);
			if (!n) throw ErrorCode.Not_Found;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/:tagId', [checkTokenCms, checkPermission([Role.USER, Role.CATEGORY, Role.ADMIN])])
	async updateTag(req: Request, res: Response, next: NextFunction) {
		try {
			validate(tagSchema, req.body);
			const { n } = await service.updateTag(req.params.tagId, req.body);
			if (!n) throw ErrorCode.Not_Found;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/:tagId', [checkTokenCms, checkPermission([Role.USER, Role.CATEGORY, Role.ADMIN])])
	async getTagById(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await service.getTagById(req.params.tagId);
			if (!result) {
				throw ErrorCode.Not_Found;
			}
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
