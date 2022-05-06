import { Request, Response, NextFunction } from 'express';
import { CmsController, Post } from '$decorator/routeCms.decorator';
import { done } from '$utils/response';
import axios from 'axios';
import { awsGetThumb } from '$utils/utils';
import s3StorageService from '$config/s3Upload';
import log from '$config/log';
import { checkTokenCms } from '$middleware/cms.middleware';
const logger = log('Upload controller');

@CmsController('/upload')
export default class UploadController {
	@Post('/', [s3StorageService.upload.array('files', 3)])
	async uploadImage(req: Request, res: Response, next: NextFunction) {
		let files = [];
		if (req['files'] && req['files'].length > 0) {
			req['files'].forEach((f: any) => {
				files.push(f.key);
				// try {
				//   if (/\.(gif|jpe?g|tiff|png|webp|bmp|svg|heic)$/gi.test(f.key)) {
				//     axios.get(awsGetThumb(f.key, '50x50'));
				//   }
				// } catch (e) {
				//   logger.error(e);
				// }
			});
		}
		return done(res, files);
	}
}
