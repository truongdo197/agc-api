import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { ErrorCode } from '$enum/common';
import { checkRefreshTokenCMS } from '$middleware/cms.middleware';
import { LoginRequest, RequestTokenRequest, ChangePasswordRequest } from './auth.interface';
import { validate } from '$config/ajv';
import {
	loginSchema,
	changePasswordSchema,
	requestNewTokenSchema,
	requestVerifiedCodeSchema,
	checkVerifiedCodeSchema,
	resetPasswordSchema,
} from './auth.validate';
import log from '$config/log';
import * as service from './auth.service';
const logger = log('Auth CMS controller');

@CmsController('/auth')
export default class AuthController {
	@Post('/login', [])
	async login(req: LoginRequest, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(loginSchema, body);
			const response = await service.login(body);
			return done(res, response);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Put('/change-password')
	async changePassword(req: Request, res: Response, next: NextFunction) {
		try {
			const { userId, body } = req;
			validate(changePasswordSchema, body);
			await service.changePassword(userId, body);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/refresh-token', [checkRefreshTokenCMS])
	async refreshToken(req: RequestTokenRequest, res: Response, next: NextFunction) {
		try {
			const { userId } = req;
			const body = req.body;
			validate(requestNewTokenSchema, body);
			const data = await service.generateNewRefreshToken(userId, body.refreshToken);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/request-verified-code', [])
	async requestVerifiedCode(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(requestVerifiedCodeSchema, body);
			await service.requestVerifiedCode(body.email);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Post('/check-verified-code', [])
	async checkVerifiedCode(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(checkVerifiedCodeSchema, body);
			const data = await service.checkVerifiedCode(body);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/reset-password', [])
	async resetPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(resetPasswordSchema, body);
			const data = await service.resetPassword(body);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
