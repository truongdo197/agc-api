import Redis, { RedisOptions } from 'ioredis';
import env from './env';
import log from './log';
const logger = log('Connect Redis');

export function createRedisConnection(option?: RedisOptions) {
	try {
		if (!option) {
			option = { port: env.redis.port, host: env.redis.host, password: env.redis.password, db: 0 };
		}
		const conn = new Redis({
			port: option.port || env.redis.port,
			host: option.host || env.redis.host,
			password: option.password || env.redis.password,
			db: option.db || 0,
			connectTimeout: 10000,
		});
		return conn;
	} catch (error) {
		logger.error(error);
	}
}

const connRedis = createRedisConnection();
export default connRedis;

// Xóa hết cache có key bắt đầu bằng string truyền vào.
export async function clearRedisData(mark: string) {
	// Lấy ra list key có cùng mark.
	const keys = await connRedis.keys(mark + '*');
	// Xóa tất cả key có cùng mark đi.
	const clearData = keys.map((item: any) => {
		return connRedis.del(item);
	});
	// exec
	return await Promise.all(clearData);
}
