import { Response, NextFunction, Request } from 'express';
import { done, ErrorHandlerController } from '$utils/response';
import log from '$config/log';
import { WebController, Get, Post, Put, Delete } from '$decorator/routeWeb.decorator';
import _, { has } from 'lodash';
import * as services from './post.service';
import { setDataPaging } from '$utils/utils';
const logger = log('Product Web controller');

@WebController('/posts')
export default class ProductController {
	@Get('/news-from-common')
	async getNewsListFromCommon(req: Request, res: Response, next: NextFunction) {
		try {
			const limit = has(req, 'query.limit') ? Number(req.query.limit) : null; //mac dinh 10 post
			const data = await services.getNewsListFromCommon(limit);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/new-product-news-from-common')
	async getNewProductNewsListFromCommon(req: Request, res: Response, next: NextFunction) {
		try {
			const limit = has(req, 'query.limit') ? Number(req.query.limit) : null; //mac dinh 10 post
			const data = await services.getNewProductNewsListFromCommon(limit);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/similar')
	async getListPostSimilarCategory(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			const data = await services.getListProductSimilar(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/similar/product')
	async getListPostSimilarProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			const data = await services.getListProductSimilarProduct(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/detail/:postId')
	async getDetailPost(req: Request, res: Response, next: NextFunction) {
		try {
			const postId = req.params.postId;
			const data = await services.getDetailPost(postId);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/new-product-news')
	async getListNewProductNews(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const data = await services.getListNewProductNews(params);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
