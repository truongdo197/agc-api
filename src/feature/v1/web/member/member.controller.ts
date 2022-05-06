import { Response, NextFunction, Request } from 'express';
import { WebController, Get, Post, Put, Delete } from '$decorator/routeWeb.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import log from '$config/log';
import * as service from './member.service';
import { validate } from '$config/ajv';

import { ErrorCode, Role } from '$enum/common';
import {
	sendMailResetPasswordSchema,
	resetPasswordSchema,
	changePasswordSchema,
} from './member.validate';
import { checkTokenWeb } from '$middleware/web.middleware';
import {
	listMemberSchema,
	addMemberSchema,
	updateProfileMemberSchema,
	signInSchema,
} from './member.validate';

const logger = log('Member CMS controller');

@WebController('/member')
export default class MemberController {
	@Get('/detail')
	async getDetailMember(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.userId;
			const data = await service.getDetailMember(userId);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/sign-up')
	async signUp(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(addMemberSchema, body);
			await service.addMember(body);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Post('/sign-in')
	async signIn(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(signInSchema, body);
			const token = await service.signIn(body);
			return done(res, token);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/social-login/auth')
	async socialLogin(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			// validate(signInSchema, body);
			const token = await service.socialAuth(body);
			return done(res, token);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/send-mail-reset-password')
	async sendMailResetPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(sendMailResetPasswordSchema, body);
			await service.sendMailResetPassword(body.email);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Post('/reset-password')
	async resetPassword(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(resetPasswordSchema, body);
			await service.resetPassword(body);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/check-reset-token')
	async checkResetToken(req: Request, res: Response, next: NextFunction) {
		try {
			const token = req.query.token;
			const isExists = await service.checkResetTokenExists(token);
			return done(res, isExists);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Get('/profile', [checkTokenWeb])
	async getProfileMember(req: Request, res: Response, next: NextFunction) {
		try {
			const memberId = req.memberId;
			const member = await service.getDetailMember(memberId);
			return done(res, member);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/profile', [checkTokenWeb])
	async updateProfileMember(req: Request, res: Response, next: NextFunction) {
		try {
			const memberId = req.memberId;
			const body = req.body;
			validate(updateProfileMemberSchema, body);
			const member = await service.updateProfile(memberId, body);
			return done(res, member);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/change-password', [checkTokenWeb])
	async changePassword(req: Request, res: Response, next: NextFunction) {
		try {
			const memberId = req.memberId;
			const body = req.body;
			validate(changePasswordSchema, body);
			const member = await service.changePassword(memberId, body.newPassword, body.oldPassword);
			return done(res, member);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
