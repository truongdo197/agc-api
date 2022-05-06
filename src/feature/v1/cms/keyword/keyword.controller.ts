import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './keyword.service';
import { validate } from '$config/ajv';
import { listKeywordSchema, addKeywordSchema } from './keyword.validate';
import { ErrorCode, Role } from '$enum/common';
import { checkTokenCms, checkPermission } from '$middleware/cms.middleware';

const logger = log('Keyword CMS controller');

@CmsController('/keywords')
export default class KeywordController {
	@Get('/', [checkTokenCms, checkPermission([Role.USER, Role.ADMIN])])
	async getListKeyword(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			validate(listKeywordSchema, query);
			const data = await service.getListKeyword(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/', [checkTokenCms, checkPermission([Role.USER, Role.ADMIN])])
	async createKeyword(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(addKeywordSchema, body);
			const keyword = await service.createKeyword(body);
			return done(res, keyword);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/:keywordId', [checkTokenCms, checkPermission([Role.USER, Role.ADMIN])])
	async uptopKeyword(req: Request, res: Response, next: NextFunction) {
		try {
			const keywordId = req.params.keywordId;
			const body = req.body;
			await service.updateKeyword(keywordId, body.numbers as number);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Delete('/:keywordId', [checkTokenCms, checkPermission([Role.USER, Role.ADMIN])])
	async deleteKeyword(req: Request, res: Response, next: NextFunction) {
		try {
			const keywordId = req.params.keywordId;
			await service.deleteKeyword(keywordId);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
