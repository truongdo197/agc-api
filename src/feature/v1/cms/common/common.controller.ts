import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import { validate } from '$config/ajv';
import * as service from './common.service';
import { Role } from '$enum/common';
import { checkPermission, checkTokenCms } from '$middleware/cms.middleware';
import { updateAFLinkValidate } from './common.validate';
import {
	updateHotProductListValidate,
	updateAdvertisingProductListValidate,
} from './common.validate';

const logger = log('Commons CMS controller');

@CmsController('/commons')
export default class CommonController {
	@Get('/get-news-list', [checkTokenCms, checkPermission([Role.ADMIN, Role.COMMON_SETTING])])
	async getNewsList(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await service.getNewsList();
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/get-hot-product-list', [checkTokenCms, checkPermission([Role.ADMIN, Role.COMMON_SETTING])])
	async getHotProductList(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await service.getHotProductList();
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/get-new-product-list', [checkTokenCms, checkPermission([Role.ADMIN, Role.COMMON_SETTING])])
	async getNewProductList(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await service.getNewProductList();
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/sponsor-product', [checkTokenCms, checkPermission([Role.ADMIN])])
	async getSettingSponsorProductList(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await service.getSettingSponsorProductList();
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/sponsor-product', [checkTokenCms, checkPermission([Role.ADMIN])])
	async updateSettingSponsorProduct(req: Request, res: Response, next: NextFunction) {
		try {
			const items = req.body.items;
			await service.updateSettingSponsorProduct(items);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/get-advertising-product-list', [
		checkTokenCms,
		checkPermission([Role.ADMIN, Role.COMMON_SETTING]),
	])
	async getAdvertisingProductList(req: Request, res: Response, next: NextFunction) {
		try {
			const params = setDataPaging(req.query);
			const result = await service.getAdvertisingProductList(params);
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/slogan', [checkTokenCms, checkPermission([Role.ADMIN])])
	async getSlogan(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await service.getSlogan();
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/af-link', [checkTokenCms, checkPermission([Role.ADMIN])])
	async getAFLink(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await service.getAFLink();
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/google-tag-script', [checkTokenCms, checkPermission([Role.ADMIN])])
	async getGoogleTagScript(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await service.getGoogleTagScript();
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/google-tag-script', [checkTokenCms, checkPermission([Role.ADMIN])])
	async updateGoogleTagScript(req: Request, res: Response, next: NextFunction) {
		try {
			const content = req.body.content;
			await service.updateGoogleTagScript(content);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/slogan', [checkTokenCms, checkPermission([Role.ADMIN])])
	async updateSlogan(req: Request, res: Response, next: NextFunction) {
		try {
			const content = req.body.content;
			await service.updateSlogan(content);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/af-link', [checkTokenCms, checkPermission([Role.ADMIN])])
	async updateAFLink(req: Request, res: Response, next: NextFunction) {
		try {
			validate(updateAFLinkValidate, req.body);
			const { rakuten, yahoo, amazon } = req.body;
			await service.updateAFLink(rakuten, amazon, yahoo);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/update-hot-product-list', [
		checkTokenCms,
		checkPermission([Role.ADMIN, Role.COMMON_SETTING]),
	])
	async updateHotProductList(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(updateHotProductListValidate, body);
			const result = await service.updateHotProductList(body.productIds);
			return done(res, result);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/update-advertising-product-list', [
		checkTokenCms,
		checkPermission([Role.ADMIN, Role.COMMON_SETTING]),
	])
	async updateAdvertisingProductList(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(updateAdvertisingProductListValidate, body);
			await service.updateAdvertisingProductList(body.productIds);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
