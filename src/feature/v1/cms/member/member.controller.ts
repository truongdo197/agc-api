import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './member.service';
import { validate } from '$config/ajv';
import { listMemberSchema, addMemberSchema, updateMemberSchema } from './member.validate';
import { ErrorCode, Role } from '$enum/common';
import { checkTokenCms, checkPermission } from '$middleware/cms.middleware';

const logger = log('Member CMS controller');

@CmsController('/members')
export default class MemberController {
	@Get('/', [checkTokenCms, checkPermission([Role.USER, Role.ADMIN])])
	async getListMember(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			validate(listMemberSchema, query);
			const data = await service.getListMember(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/:memberId', [checkTokenCms, checkPermission([Role.USER, Role.ADMIN])])
	async getDetailMember(req: Request, res: Response, next: NextFunction) {
		try {
			const memberId = req.params.memberId;
			const data = await service.getDetailMember(memberId);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/', [checkTokenCms, checkPermission([Role.USER, Role.ADMIN])])
	async createMember(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(addMemberSchema, body);
			const member = await service.createMember(body);
			return done(res, member);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/:memberId', [checkTokenCms, checkPermission([Role.USER, , Role.ADMIN])])
	async updateMember(req: Request, res: Response, next: NextFunction) {
		try {
			const memberId = req.params.memberId;
			const body = req.body;
			validate(updateMemberSchema, body);
			await service.updateMember(memberId, body);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Delete('/:memberId', [checkTokenCms, checkPermission([Role.USER, Role.ADMIN])])
	async deleteMember(req: Request, res: Response, next: NextFunction) {
		try {
			const memberId = req.params.memberId;
			await service.deleteMember(memberId);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
