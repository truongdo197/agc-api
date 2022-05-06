import { Response, NextFunction, Request } from 'express';
import { WebController, Get, Post } from '$decorator/routeWeb.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './favoriteProduct.service';
import { validate } from '$config/ajv';
import {
	addAndUnmarkProductToFavoriteSchema,
	addProductToWatchingListSchema,
	getWatchingListsSchema,
	getListProductByWatchingListSchema,
} from './favoriteProduct.validate';
import { checkTokenWeb } from '$middleware/web.middleware';

const logger = log('Favorite Product WEB controller');

@WebController('/favorite-product')
export default class FavoriteProductController {
	@Post('/add', [checkTokenWeb])
	async addProductToFavoriteList(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(addAndUnmarkProductToFavoriteSchema, body);
			const favoriteProduct = await service.addProductToFavorite(req.memberId, body);
			return done(res, favoriteProduct);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Post('/unmark', [checkTokenWeb])
	async unmarkAsFavorite(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(addAndUnmarkProductToFavoriteSchema, body);
			const favoriteProduct = await service.unmarkAsFavorite(req.memberId, body.productId);
			return done(res, favoriteProduct);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/list', [checkTokenWeb])
	async getListFavoriteProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const body = setDataPaging(req.query);
			const favoriteProduct = await service.getListFavoriteProduct(req.memberId, body);
			return done(res, favoriteProduct);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
