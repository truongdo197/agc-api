import { pushDataToCrawlerRedis } from '$config/jobs/method';
import connRedisUrl from '$config/redisAddUrl';
import { RedisCrawlerQueue, SourceProduct } from '$enum/common';
import Ranking from '$schema/Ranking';
import * as model from './ranking.model';

export async function getListRanking(params: any) {
	return await model.getListRanking(params);
}

export async function createRanking(params: any) {
	return await model.addRanking(params);
}

export async function recrawlRanking() {
	const rankingConditions = {
		$or: [
			{ source: SourceProduct.AMAZON },
			{ source: SourceProduct.YAHOO, parent_id: { $exists: false } },
			{ source: SourceProduct.RAKUTEN, parent_id: { $exists: false } },
		],
	};
	const RECORD_LIMIT = 100;
	const rankingLength = await Ranking.countDocuments(rankingConditions);
	const totalPages = Math.ceil(rankingLength / RECORD_LIMIT);
	for (let i = 0; i < totalPages; i++) {
		const rankings = await Ranking.find(rankingConditions)
			.select('url source')
			.skip(RECORD_LIMIT * i)
			.limit(RECORD_LIMIT);

		rankings.forEach((ranking) => {
			addQueueRanking(ranking);
		});
	}
}

export async function addQueueRanking(Ranking: { url: string; source: string }) {
	if (Ranking.source === SourceProduct.AMAZON) {
		return pushDataToCrawlerRedis(Ranking.url, RedisCrawlerQueue.AMAZON_RANKING, connRedisUrl);
	}
	if (Ranking.source === SourceProduct.YAHOO) {
		return pushDataToCrawlerRedis(Ranking.url, RedisCrawlerQueue.YAHOO_RANKING, connRedisUrl);
	}
	if (Ranking.source === SourceProduct.RAKUTEN) {
		return pushDataToCrawlerRedis(Ranking.url, RedisCrawlerQueue.RAKUTEN_RANKING, connRedisUrl);
	}
}
