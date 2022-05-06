import { Response, NextFunction, Request } from 'express';
import { WebController, Get, Post, Put } from '$decorator/routeWeb.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './notification.service';
import { validate } from '$config/ajv';

import { checkTokenWeb } from '$middleware/web.middleware';

const logger = log('Notification WEB controller');

@WebController('/notifications')
export default class FavoriteProductController {
	@Get('/list', [checkTokenWeb])
	async getListNotification(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const notifications = await service.getListNotification(req.memberId, params);
			return done(res, notifications);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/has-unread-noti', [checkTokenWeb])
	async hasUnreadNoti(req: Request, res: Response, next: NextFunction) {
		try {
			const count = await service.hasUnreadNoti(req.memberId);
			return done(res, count);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/mark-noti-as-read/:notiId', [checkTokenWeb])
	async markNotiAsRead(req: Request, res: Response, next: NextFunction) {
		try {
			await service.markNotiAsRead(req.params.notiId);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
