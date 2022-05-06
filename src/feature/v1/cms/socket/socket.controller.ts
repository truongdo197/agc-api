import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './socket.service';
import { validate } from '$config/ajv';

import { ErrorCode } from '$enum/common';

const logger = log('Socket CMS controller');

@CmsController('/socket')
export default class SocketController {
	@Post('/')
	async handleEmit(req: Request, res: Response, next: NextFunction) {
		try {
			await service.handleEmit();
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
