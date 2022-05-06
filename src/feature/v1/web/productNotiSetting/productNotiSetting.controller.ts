import { Response, NextFunction, Request } from 'express';
import { WebController, Get, Post } from '$decorator/routeWeb.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './productNotiSetting.service';
import { validate } from '$config/ajv';

import { checkTokenWeb } from '$middleware/web.middleware';

const logger = log('Product Setting Notification WEB controller');

@WebController('/product-noti-settings')
export default class FavoriteProductController {
	@Post('/add', [checkTokenWeb])
	async doubleSettingNotiForProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			const productSettingNotifications = await service.doubleSettingNotiForProduct(
				req.memberId,
				body
			);

			return done(res, productSettingNotifications);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/detail/:productId', [checkTokenWeb])
	async getDetailProductNotiSetting(req: Request, res: Response, next: NextFunction) {
		try {
			const productId = req.params.productId;
			const detailSetting = await service.getDetailProductNotiSetting(req.memberId, productId);
			return done(res, detailSetting);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
