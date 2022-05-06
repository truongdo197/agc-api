import Redis, { RedisOptions } from 'ioredis';
import log from './log';
import env from '$config/env';
const logger = log('Connect Redis');

export function createRedisConnection(option?: RedisOptions) {
	try {
		const conn = new Redis({
			port: env.redisCrawler.port,
			host: env.redisCrawler.host,
			password: env.redisCrawler.password,
			connectTimeout: 10000,
		});
		return conn;
	} catch (error) {
		logger.error(error);
	}
}
const connRedisUrl = createRedisConnection();
export default connRedisUrl;
