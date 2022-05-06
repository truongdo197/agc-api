import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './account.service';
import { validate } from '$config/ajv';
import {
	listAccountSchema,
	addAccountSchema,
	updateAccountSchema,
	deleteAccountSchema,
} from './account.validate';
import { checkTokenCms, checkPermission } from '$middleware/cms.middleware';
import { ErrorCode, Role } from '$enum/common';

const logger = log('Account CMS controller');

@CmsController('/account')
export default class AccountController {
	@Get('/', [checkTokenCms, checkPermission([Role.ADMIN, Role.ACCOUNT])])
	async getListAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			validate(listAccountSchema, query);
			const data = await service.getListAccount(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/detail')
	async getDetailAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.userId;
			const data = await service.getDetailAccount(userId);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/', [checkTokenCms, checkPermission([Role.ADMIN, Role.ACCOUNT])])
	async createdAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(addAccountSchema, body);
			await service.addAccount(body);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/profile', [checkTokenCms])
	async updateProfileAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const accountId = req.userId;
			const body = req.body;
			body.id = accountId;
			validate(updateAccountSchema, body);
			await service.updateAccount(body);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/:accountId', [checkTokenCms, checkPermission([Role.ADMIN, Role.ACCOUNT])])
	async updateAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const accountId = req.params.accountId;
			const body = req.body;
			body.id = accountId;
			validate(updateAccountSchema, body);
			await service.updateAccount(body);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Delete('/:accountId', [checkTokenCms, checkPermission([Role.ADMIN, Role.ACCOUNT])])
	async deleteAccount(req: Request, res: Response, next: NextFunction) {
		try {
			const accountId = req.params.accountId;
			const body = { _id: accountId };
			validate(deleteAccountSchema, body);
			const { n } = await service.deleteAccount(body);
			if (!n) throw ErrorCode.Not_Found;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
