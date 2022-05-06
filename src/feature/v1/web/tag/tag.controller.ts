import { Response, NextFunction, Request } from 'express';
import { WebController, Get } from '$decorator/routeWeb.decorator';
import { done, ErrorHandlerController } from '$utils/response';

import log from '$config/log';
import * as service from './tag.service';
import { ErrorCode } from '../../../../types/enum/common';
import { setDataPaging } from '../../../../utils/utils';
const logger = log('Auth Web controller');

@WebController('/tags')
export default class TagController {
	@Get('/')
	async getTagList(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const result = await service.getTagList(params);
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/:tagId')
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
