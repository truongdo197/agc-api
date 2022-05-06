import { validate } from '$config/ajv';
import log from '$config/log';
import { CmsController, Get } from '$decorator/routeCms.decorator';
import { Role } from '$enum/common';
import { checkPermission, checkTokenCms } from '$middleware/cms.middleware';
import { done, ErrorHandlerController } from '$utils/response';
import { NextFunction, Request, Response } from 'express';
import * as services from './redis.service';

const logger = log('Redis Queue CMS controller');

@CmsController('/redis-queue')
export default class RedisQueueController {
	@Get('/', [checkTokenCms, checkPermission([Role.ADMIN])])
	async getAllResources(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await services.getAllResources();
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
