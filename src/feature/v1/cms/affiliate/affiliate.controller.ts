import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './affiliate.service';
import { validate } from '$config/ajv';
import { checkTokenCms, checkPermission } from '$middleware/cms.middleware';
import { ErrorCode, Role } from '$enum/common';
import { createAffiliateUrlSchema } from './affiliate.validate';

const logger = log('Affiliate CMS controller');

@CmsController('/affiliate')
export default class AffiliateController {
	@Post('/', [checkTokenCms, checkPermission([Role.ADMIN])])
	async createAffiliateUrl(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(createAffiliateUrlSchema, body);
			await service.createAffiliateUrl(body);
			return done(res, { success: true });
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
