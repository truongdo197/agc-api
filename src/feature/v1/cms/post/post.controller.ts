import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';

import log from '$config/log';
import * as services from './post.service';
import { validate } from '$config/ajv';

import { ErrorCode } from '../../../../types/enum/common';
import { createPostSchema, updatePostSchema } from './post.validate';
import { setDataPaging } from '$utils/utils';
import { has } from 'lodash';
import { Role } from '$enum/common';
import { checkPermission, checkTokenCms } from '$middleware/cms.middleware';

const logger = log('Post CMS controller');

@CmsController('/posts')
export default class ResourceController {
	@Post('/', [checkTokenCms, checkPermission([Role.USER, Role.POST, Role.ADMIN])])
	async createPost(req: Request, res: Response, next: NextFunction) {
		try {
			const params = req.body;
			params.postType = Number(req.body.postType);
			params.createdBy = req.userId;
			validate(createPostSchema, params);
			const result = await services.createPost(params);
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Delete('/:postId', [checkTokenCms, checkPermission([Role.USER, Role.POST, Role.ADMIN])])
	async deletePost(req: Request, res: Response, next: NextFunction) {
		try {
			const postId = req.params.postId;
			await services.deletePost(postId);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/', [checkTokenCms, checkPermission([Role.USER, Role.POST, Role.ADMIN])])
	async getPostList(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			params.type = has(req, 'query.type') ? Number(req.query.type) : 1;
			const data = await services.getPostList(params);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/update-news-list', [
		checkTokenCms,
		checkPermission([Role.USER, Role.COMMON_SETTING, Role.ADMIN]),
	])
	async updateNewsList(req: Request, res: Response, next: NextFunction) {
		try {
			const postIds = req.body.postIds;
			await services.chosenNews(postIds);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/update-new-product-news-list', [
		checkTokenCms,
		checkPermission([Role.USER, Role.COMMON_SETTING, Role.ADMIN]),
	])
	async updateNewProductNewsList(req: Request, res: Response, next: NextFunction) {
		try {
			const postIds = req.body.postIds;
			await services.chosenNewProductNews(postIds);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/:postId', [checkTokenCms, checkPermission([Role.USER, Role.POST, Role.ADMIN])])
	async updatePost(req: Request, res: Response, next: NextFunction) {
		try {
			const postId = req.params.postId;
			validate(updatePostSchema, req.body);
			const { n } = await services.updatePost(postId, req.body);
			if (!n) throw ErrorCode.Not_Found;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/:postId', [checkTokenCms, checkPermission([Role.USER, Role.POST, Role.ADMIN])])
	async getDetailPost(req: Request, res: Response, next: NextFunction) {
		try {
			const postId = req.params.postId;
			const data = await services.getDetailPost(postId);
			if (!data) {
				throw ErrorCode.Not_Found;
			}
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
