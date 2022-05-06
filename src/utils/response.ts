import { Request, Response, NextFunction } from 'express';
import { ErrorCode, ErrorMessage } from '$enum/common';
import log from '$config/log';
import { Logger } from 'log4js';
const logger = log('Error handle');
/**
 * Get status code & error code, default status code for error = 400;
 */

export class ErrorHandler extends Error {
	public errorCode: number;
	public statusCode: number;
	public errorMessage: string;
	public validateMessage: string;
	constructor(
		error: Error | ErrorHandler | number,
		statusCode?: number,
		validateMessage: any = ''
	) {
		super();
		if (error.hasOwnProperty('errorCode')) {
			this.errorCode = error['errorCode'];
			this.statusCode = error['statusCode'] || 400;
			this.errorMessage = ErrorMessage[this.errorCode] || '';
			this.validateMessage = validateMessage;
		} else {
			this.errorCode = typeof error === 'number' ? error : Number(error.message) | 0;
			this.statusCode = statusCode || 400;
			this.errorMessage = ErrorMessage[this.errorCode] || '';
			this.validateMessage = validateMessage;
		}
	}
}

export class ErrorHandlerController extends Error {
	public errorCode: number;
	public statusCode: number;
	public errorMessage: string;
	public logger: Logger;
	public validateMessage: string;
	constructor(error: Error | ErrorHandler, logger: Logger, statusCode?: number) {
		super();
		logger.error(error);
		if (error.hasOwnProperty('errorCode')) {
			this.errorCode = error['errorCode'];
			this.statusCode = error['statusCode'] || 400;
			this.errorMessage = error['errorMessage'] || ErrorMessage[ErrorCode[this.errorCode]];
			this.validateMessage = error['validateMessage'];
		} else {
			this.errorCode = typeof error === 'number' ? error : Number(error.message) | 0;
			this.statusCode = statusCode || 400;
			this.errorMessage = error['errorMessage'] || ErrorMessage[ErrorCode[this.errorCode]];
			this.validateMessage = error['validateMessage'];
		}
	}
}

export const handleError = (
	error: ErrorHandler | ErrorHandlerController,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { statusCode, errorCode, errorMessage, validateMessage } = error;
	const responseData = {
		errorCode,
		errorMessage,
		data: null,
	};
	if (process.env.NODE_ENV === 'dev') responseData['validateMessage'] = validateMessage;
	return res.status(statusCode).send(responseData);
};

export const done = (
	res: Response,
	data: any = null,
	errorCode: number = -1,
	statusCode: number = 200
) => {
	if (data && data.paging === true) {
		return res.status(statusCode).send({
			errorCode,
			errorMessage: '',
			...data,
		});
	}
	return res.status(statusCode).send({ errorCode, errorMessage: '', data });
};

export const paramSocket = (nameEmit: string, data: any = null) => {
	return {
		nameEmit,
		data: data,
	};
};
