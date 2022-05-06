import { Response, NextFunction, Request } from 'express';
import { CmsController, Get, Post, Put, Delete } from '$decorator/routeCms.decorator';
import { done, ErrorHandlerController } from '$utils/response';
import { setDataPaging } from '$utils/utils';
import log from '$config/log';
import * as service from './point.service';
import { validate } from '$config/ajv';
import { listPointSchema, addPointSchema, updatePointSchema } from './point.validate';
import { ErrorCode, Role } from '$enum/common';
import { checkTokenCms, checkPermission } from '$middleware/cms.middleware';

const logger = log('Point CMS controller');

@CmsController('/points')
export default class PointController {
	@Get('/', [checkTokenCms, checkPermission([Role.USER, Role.POINT, Role.ADMIN])])
	async getListPoint(req: Request, res: Response, next: NextFunction) {
		try {
			const query = setDataPaging(req.query);
			validate(listPointSchema, query);
			const data = await service.getListPoint(query);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
	@Get('/:pointId', [checkTokenCms, checkPermission([Role.USER, Role.POINT, Role.ADMIN])])
	async getDetailPoint(req: Request, res: Response, next: NextFunction) {
		try {
			const pointId = req.params.pointId;
			const data = await service.getDetailPoint(pointId);
			return done(res, data);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Post('/', [checkTokenCms, checkPermission([Role.USER, Role.POINT, Role.ADMIN])])
	async createPoint(req: Request, res: Response, next: NextFunction) {
		try {
			const body = req.body;
			validate(addPointSchema, body);
			await service.addPoint(body);
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Put('/:pointId', [checkTokenCms, checkPermission([Role.USER, Role.POINT, Role.ADMIN])])
	async updatePoint(req: Request, res: Response, next: NextFunction) {
		try {
			const pointId = req.params.pointId;
			const body = req.body;
			body._id = pointId;
			validate(updatePointSchema, body);
			const { n } = await service.updatePoint(body);
			if (!n) throw ErrorCode.Point_Not_Exist;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}

	@Delete('/:pointId', [checkTokenCms, checkPermission([Role.USER, Role.POINT, Role.ADMIN])])
	async deletePoint(req: Request, res: Response, next: NextFunction) {
		try {
			const pointId = req.params.pointId;
			const { n } = await service.deletePoint(pointId);
			if (!n) throw ErrorCode.Point_Not_Exist;
			return done(res);
		} catch (error) {
			next(new ErrorHandlerController(error, logger));
		}
	}
}
