import log from '$config/log';
import { Request, Response, NextFunction } from 'express';
const logger = log('Middle ware check token');
import { ErrorHandler } from '$utils/response';
import { verify } from 'jsonwebtoken';
import config from '$config/env';
import { getUserById } from '$feature/v1/cms/auth/auth.model';
import { promisify } from 'util';
import { ErrorCode, UserStatus } from '$types/enum/common';
const verifyAsync = promisify(verify) as any;

export function checkTokenCms(req: Request, res: Response, next: NextFunction) {
	let token = req.headers['authorization'] || '';
	token = token.replace('Bearer ', '');
	if (!token) {
		throw new ErrorHandler(ErrorCode.Token_Not_Exist);
	}

	verifyAsync(token, config.auth.tokenCms)
		.then(async (decoded: any) => {
			try {
				// FIXME: Chưa có cơ chế cache user permission & user status.
				const user = await getUserById(decoded._id);
				if (!user.active) {
					throw new ErrorHandler(ErrorCode.User_Blocked);
				}
				req.userId = decoded._id;
				req.permissions = decoded.roles || [];
				next();
			} catch (error) {
				next(new ErrorHandler(error));
			}
		})
		.catch(() => {
			next(new ErrorHandler(ErrorCode.Token_Expired, 401));
		});
}

export function checkRefreshTokenCMS(req: Request, res: Response, next: NextFunction) {
	const refreshToken = req.body.refreshToken || '';
	if (!refreshToken) {
		logger.error('Can not find the refresh token');
		throw new ErrorHandler(ErrorCode.Refresh_Token_Not_Exist);
	}

	verifyAsync(refreshToken, config.auth.tokenRefreshCms)
		.then(async (decoded: any) => {
			try {
				const user = await getUserById(decoded._id);
				if (!user) throw new ErrorHandler(ErrorCode.Unknown_Error);
				if (!user.active) throw new ErrorHandler(ErrorCode.User_Blocked);
				req.userId = decoded._id;
				req.permissions = decoded.roles || [];
				next();
			} catch (error) {
				next(new ErrorHandler(error));
			}
		})
		.catch(() => {
			next(new ErrorHandler(ErrorCode.Refresh_Token_Expire, 401));
		});
}

export function checkPermission(permissions: ReadonlyArray<string>) {
	return function (req: Request, res: Response, next: NextFunction) {
		const hasOwnPermission = permissions.some((permission) => req.permissions.includes(permission));
		if (!hasOwnPermission) {
			next(new ErrorHandler(ErrorCode.Permission_Denied));
		}
		next();
	};
}
