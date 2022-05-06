import { Response, NextFunction, Request } from 'express';
import { done, ErrorHandlerController } from '$utils/response';
import { validate } from '$config/ajv';
import log from '$config/log';
import { WebController, Get, Post, Put, Delete } from '$decorator/routeWeb.decorator';
import { listProductSchema, productHistorySchema } from './product.validate';
import _, { has } from 'lodash';
import * as services from './product.service';

import { setDataPaging } from '$utils/utils';
import escapeStringRegexp from 'escape-string-regexp';
import { uniqBy } from 'lodash';
import { checkTokenWeb } from '$middleware/web.middleware';

const logger = log('Product Web controller');

@WebController('/products')
export default class ProductController {
	@Get('/product-history', [checkTokenWeb])
	async getListProductHistory(req: Request, res: Response, next: NextFunction) {
		try {
			const memberId = req.memberId;
			req.query.memberId = memberId;
			const query = setDataPaging(req.query);

			const data = await services.getListProductHistory(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/')
	async getListProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			validate(listProductSchema, params);
			const data = await services.getListProduct(params);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/hot-product-list')
	async getHotProductList(req: Request, res: Response, next: NextFunction) {
		try {
			const limit = has(req, 'query.limit') ? Number(req.query.limit) : 10; //mac dinh 10 san pham
			const memberId = req.query.memberId;
			const data = await services.getHotProductList(limit, memberId as string);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/get-advertising-product-list')
	async getAdvertisingProductList(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const result = await services.getAdvertisingProductList(params);
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/keyword')
	async getKeywordList(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const data = await services.getKeywordList(params);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/product-by-ids')
	async getProductByIds(req: Request, res: Response, next: NextFunction) {
		try {
			const productIds = req.query.productIds;
			const data = await services.getProductByIds(productIds as string[]);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/product-sort-by-views')
	async getTopViewProducts(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const data = await services.getTopViewProducts(params);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/search')
	async searchProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const params = req.body;
			params.start = (params.pageIndex - 1) * params.pageSize;
			validate(listProductSchema, params);
			if (params.keyword) {
				params.keyword = escapeStringRegexp(params.keyword);
			}
			let data = await services.searchProduct(params);
			data.data = uniqBy(data.data, '_id');
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/similar')
	async getListProductSimilar(req: Request, res: Response, next: NextFunction) {
		try {
			let productId = req.query.productId as string;
			const data = await services.getListProductSimilar(productId);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/:productId')
	async getDetailProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const productId = req.params.productId;
			const memberId = req.query.memberId;
			const data = await services.getDetailProduct(productId, memberId as string);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/product-history', [checkTokenWeb])
	async addProductHistory(req: Request, res: Response, next: NextFunction) {
		try {
			const memberId = req.memberId;
			validate(productHistorySchema, req.body);
			const data = await services.addProductHistory(memberId, req.body);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/jancode/:jancode')
	async getDetailProductByJanCode(req: Request, res: Response, next: NextFunction) {
		try {
			const jancode = req.params.jancode;
			const data = await services.getDetailProductByJanCode(jancode);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
