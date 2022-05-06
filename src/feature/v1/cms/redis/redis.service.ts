import connRedisUrl from '$config/redisAddUrl';
import { JobName, RedisCrawlerQueue } from '$enum/common';

export async function getAllResources() {
	const lengthAmazoneQueue = await connRedisUrl.llen(`${RedisCrawlerQueue.AMAZONE_DETAIL}:queue`);
	const lengthYahooQueue = await connRedisUrl.llen(`${RedisCrawlerQueue.YAHOO_SEARCH}:queue`);
	const lengthRakutenQueue = await connRedisUrl.llen(`${RedisCrawlerQueue.RAKUTEN_SEARCH}:queue`);
	const lengthSaiyasuneQueue = await connRedisUrl.llen(
		`${RedisCrawlerQueue.SAIYASUNE_DETAIL}:queue`
	);
	const [
		dataAmazoneQueue,
		dataYahooQueue,
		dataRakutenQueue,
		dataSaiyasuneQueue,
	] = await Promise.all([
		connRedisUrl.lrange(`${RedisCrawlerQueue.AMAZONE_DETAIL}:queue`, 0, lengthAmazoneQueue - 1),
		connRedisUrl.lrange(`${RedisCrawlerQueue.YAHOO_SEARCH}:queue`, 0, lengthYahooQueue - 1),
		connRedisUrl.lrange(`${RedisCrawlerQueue.RAKUTEN_SEARCH}:queue`, 0, lengthRakutenQueue - 1),
		connRedisUrl.lrange(`${RedisCrawlerQueue.SAIYASUNE_DETAIL}:queue`, 0, lengthSaiyasuneQueue - 1),
	]);
	return [...dataAmazoneQueue, ...dataYahooQueue, ...dataRakutenQueue, ...dataSaiyasuneQueue];
}
