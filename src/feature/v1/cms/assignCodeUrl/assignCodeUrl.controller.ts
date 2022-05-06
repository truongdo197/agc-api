import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';

import log from '$config/log';
import * as services from './assignCodeUrl.service';
import { validate } from '$config/ajv';

import { ErrorCode } from '../../../../types/enum/common';
import { Role } from '$enum/common';
import { checkPermission, checkTokenCms } from '$middleware/cms.middleware';
import { assignCodeSchema } from './assignCodeUrl.validate';

const logger = log('Post CMS controller');

@CmsController('/codes-file')
export default class AssignCodeAsinUrlController {
	@Post('/', [checkTokenCms, checkPermission([Role.ADMIN])])
	async handleCodesFile(req: Request, res: Response, next: NextFunction) {
		try {
			const params = req.body;
			validate(assignCodeSchema, params);
			await services.handleCodesFile(params);
			return done(res, { message: 'success' });
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
