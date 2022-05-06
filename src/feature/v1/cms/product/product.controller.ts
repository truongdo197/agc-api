import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';

import log from '$config/log';
import * as services from './product.service';
import * as productFactoryService from './manageCrawlProduct/manageCrawlProduct.service';
import { setDataPaging } from '$utils/utils';
import { validate } from '$config/ajv';
import {
	listProductSchema,
	updateProductSchema,
	addProductSchema,
	updateSubProductSchema,
} from './product.validate';
import { ErrorCode, RecrawlType } from '$types/enum/common';
import { addJobs } from '$config/jobs/jobAction';
import { productQueue } from '$config/jobs/Queue';
import { JobName } from '$types/enum/common';
import { Role } from '$enum/common';
import { checkTokenCms, checkPermission } from '$middleware/cms.middleware';
import { addProductFactory } from './product.validate';
import { createJobSyncProductFactory } from '$feature/v1/cms/product/subcribeProductServices/subcribeProduct.service';

const logger = log('Product CMS controller');

@CmsController('/products')
export default class ProductController {
	@Post('/', [checkTokenCms, checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN])])
	async createProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const params = req.body;
			validate(addProductSchema, params);
			const product = await services.createProduct(params);
			addJobs(productQueue, JobName.PUT_DATA_MONGO_TO_ELASTICSEARCH, product?._id);
			return done(res, product);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/searchSubProduct')
	async searchSubProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.body);
			validate(listProductSchema, params);
			const data = await services.searchSubProduct(params);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/mapping-subproduct-manual')
	async mappingSubProductManual(req: Request, res: Response, next: NextFunction) {
		try {
			await createJobSyncProductFactory();
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/sub-product/:subProductId', [
		checkTokenCms,
		checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN]),
	])
	async updateSubProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const subProductId = req.params.subProductId;
			validate(updateSubProductSchema, req.body);
			await services.updateSubProduct(subProductId, req.body);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/:productId', [checkTokenCms, checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN])])
	async updateProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const productId = req.params.productId;
			validate(updateProductSchema, req.body);
			await services.updateProduct(productId, req.body);
			addJobs(productQueue, JobName.PUT_DATA_MONGO_TO_ELASTICSEARCH, productId);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Delete('/:id', [checkTokenCms, checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN])])
	async deleteProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const id = req.params.id;
			const userId = req.userId;
			const reuslt = await services.deleteProduct(id, userId);
			if (!reuslt) throw ErrorCode.Not_Found;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/', [checkTokenCms, checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN])])
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

	@Get('/product-factory', [checkTokenCms, checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN])])
	async getListProductFactory(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);

			const data = await productFactoryService.getListProductFactory(params);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/product-factory/:productFactoryId/update', [
		checkTokenCms,
		checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN]),
	])
	async updateProductFactory(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			const data = await productFactoryService.updateProductFactory(
				req.params.productFactoryId,
				body
			);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/product-factory/:productFactoryId/detail', [
		checkTokenCms,
		checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN]),
	])
	async getHistoryById(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await productFactoryService.getHistoryByDetail(req.params.productFactoryId);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/sync-recrawl')
	async recrawlSubProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await services.recrawlSubProduct(RecrawlType.MANUAL);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/crawl-in-day', [checkTokenCms, checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN])])
	async crawlInDay(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await productFactoryService.statisticalCrawlInday(req.query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/fix-sub-product', [checkTokenCms, checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN])])
	async fixSubProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await services.fixSubProduct();
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/get-by-code', [checkTokenCms, checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN])])
	async getProductByCodeValue(req: Request, res: Response, next: NextFunction) {
		try {
			const data = await services.getProductByCodeValue(req.body);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/product-factory', [checkTokenCms, checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN])])
	async addProductFactory(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(addProductFactory, body);
			const data = await productFactoryService.addProductFactory(body);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/:productId', [checkTokenCms, checkPermission([Role.USER, Role.PRODUCT, Role.ADMIN])])
	async getDetailProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const productId = req.params.productId;
			const data = await services.getDetailProduct(productId);

			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
