import log from '$config/log';
import { Request, Response, NextFunction } from 'express';
const logger = log('Middle ware check token');
import { ErrorHandler } from '$utils/response';
import { verify } from 'jsonwebtoken';
import env from '$config/env';
import { promisify } from 'util';
import { ErrorCode, UserStatus } from '$enum/common';
import { getMemberById } from '$feature/v1/web/member/member.model';
const verifyAsync = promisify(verify) as any;

export function checkTokenWeb(req: Request, res: Response, next: NextFunction) {
	let token = req.headers['authorization'] || '';
	token = token.replace('Bearer ', '');
	if (!token) {
		throw new ErrorHandler(ErrorCode.Token_Not_Exist);
	}
	verifyAsync(token, env.auth.tokenWeb)
		.then(async (decoded: any) => {
			try {
				const member = await getMemberById(decoded._id);
				if (!member) throw new ErrorHandler(ErrorCode.Unknown_Error);
				if (!member.active) {
					throw new ErrorHandler(ErrorCode.Member_Blocked);
				}
				req.memberId = decoded._id;
				next();
			} catch (error) {
				next(new ErrorHandler(error));
			}
		})
		.catch(() => {
			next(new ErrorHandler(ErrorCode.Token_Expired, 401));
		});
}

export function checkRefreshTokenWeb(req: Request, res: Response, next: NextFunction) {
	const refreshToken = req.body.refreshToken || '';
	if (!refreshToken) {
		logger.error('Can not find the authorization refreshToken');
		throw new ErrorHandler(ErrorCode.Refresh_Token_Not_Exist);
	}
	verifyAsync(refreshToken, env.auth.tokenRefreshWeb)
		.then(async (decoded: any) => {
			try {
				const member = await getMemberById(decoded._id);
				if (!member) throw new ErrorHandler(ErrorCode.Unknown_Error);
				if (!member.active) throw new ErrorHandler(ErrorCode.Member_Blocked);
				req.memberId = decoded._id;
				next();
			} catch (error) {
				next(new ErrorHandler(error));
			}
		})
		.catch(() => {
			next(new ErrorHandler(ErrorCode.Refresh_Token_Not_Exist, 401));
		});
}
