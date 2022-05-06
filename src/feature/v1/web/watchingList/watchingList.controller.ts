import { Response, NextFunction, Request } from 'express';
import { WebController, Get, Post, Put, Delete } from '$decorator/routeWeb.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './watchingList.service';
import { validate } from '$config/ajv';
import {
	createWatchingListSchema,
	addProductToWatchingListSchema,
	getWatchingListsSchema,
	editWatchingListSchema,
	getListProductByWatchingListSchema,
} from './watchingList.validate';
import { checkTokenWeb } from '$middleware/web.middleware';

const logger = log('Watching List WEB controller');

@WebController('/watching-list')
export default class WatchingListController {
	@Get('/products', [checkTokenWeb])
	async getListProductByWatchingList(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			query['memberId'] = req.memberId;
			validate(getListProductByWatchingListSchema, query);
			const products = await service.getListProductByWatchingList(query);
			return done(res, products);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/', [checkTokenWeb])
	async getWatchingLists(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			query.memberId = req.memberId;
			validate(getWatchingListsSchema, query);
			const watchingLists = await service.getWatchingLists(query);
			return done(res, watchingLists);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/', [checkTokenWeb])
	async createWatchingList(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			body.member = req.memberId;
			validate(createWatchingListSchema, body);
			const watchingList = await service.createWatchingList(body);
			return done(res, watchingList);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/:watchingListId', [checkTokenWeb])
	async editWatchingList(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			const watchingListId = req.params.watchingListId;
			const memberId = req.memberId;
			validate(editWatchingListSchema, body);
			const watchingList = await service.editWatchingList(body, watchingListId, memberId);
			return done(res, watchingList);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Delete('/:watchingListId', [checkTokenWeb])
	async deleteWatchingList(req: Request, res: Response, next: NextFunction) {
		try {
			const watchingListId = req.params.watchingListId;
			const memberId = req.memberId;
			await service.deleteWatchingList(watchingListId, memberId);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/add-product', [checkTokenWeb])
	async addProductToWatchingList(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			body['memberId'] = req.memberId;
			validate(addProductToWatchingListSchema, body);
			const watchingList = await service.addProductToWatchingList(body);
			return done(res, watchingList);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
