// import { Response, NextFunction, Request } from 'express';
// import { CmsController, Get, Post, Put } from '$decorator/routeCms.decorator';
// import { done, ErrorHandlerController } from '$utils/response';

// import log from '$config/log';
// import * as service from './resource.service';
// const logger = log('Auth CMS controller');

// @CmsController('/resources')
// export default class ResourceController {
// 	@Get('/', [])
// 	async getAllResources(req: Request, res: Response, next: NextFunction) {
// 		try {
// 			const data = await service.getAllResources();
// 			return done(res, data);
// 		} catch (error) {
// 			next(new ErrorHandlerController(error, logger));
// 		}
// 	}
// }
