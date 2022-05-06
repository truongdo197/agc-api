import log from '$config/log';
import { Request, Response, NextFunction } from 'express';
const logger = log('Request');

/* Log data from client & assign languages to request */
export default function logRequest(req: Request, res: Response, next: NextFunction) {
  const method = req.method;
  const fullPath = req.originalUrl;
  const body = req.body || [];
  req.language = req.language || 'ja';
  logger.info(`Method: ${method} | FullPath: ${fullPath} | Body: ${JSON.stringify(body)}`);
  next();
}