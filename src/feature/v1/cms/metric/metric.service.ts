import * as model from './metric.model';
import { ICrawlerMetric } from './metric.interface';
import CrawlLog from '$schema/CrawlLog';
import _, { replace } from 'lodash';
import { ParamsReturnPaging } from '$types/interface/Pagination.definition';
import escapeStringRegexp from 'escape-string-regexp';
import moment from 'moment';
import connRedis from '$config/redis';

export async function updateCrawlerMetrics(body: ICrawlerMetric) {
	return await model.updateCrawlerMetrics(body);
}

export async function getTotalUrlsCrawled() {
	let [stringTotalFailedUrls, stringTotalSucceededUrls, stringTotalUrls] = await Promise.all([
		connRedis.lrange('failureUrls', 0, -1),
		connRedis.lrange('successUrls', 0, -1),
		connRedis.lrange('totalUrls', 0, -1),
	]);

	if (
		!stringTotalFailedUrls.length &&
		!stringTotalSucceededUrls.length &&
		!stringTotalUrls.length
	) {
		return;
	}
	let totalFailedUrls = _.map(stringTotalFailedUrls, (logString) => {
		const log = JSON.parse(logString);
		const msg = replace(log.msg, `URL: ${log.url} :`, '');
		return { url: log.url, msg, createdAt: moment(log.createdAt).toDate() };
	});
	await Promise.all([connRedis.del('failureUrls'), CrawlLog.insertMany([...totalFailedUrls])]);
}

export async function getCrawlLogs(params: ParamsReturnPaging) {
	const condition = {};

	if (params.keyword) {
		condition['url'] = new RegExp(escapeStringRegexp(params.keyword));
	}

	if (params.startDate) {
		condition['createdAt'] = { $gte: moment(params.startDate).toDate() };
	}

	if (params.endDate) {
		condition['createdAt'] = { ...condition['createdAt'], $lte: moment(params.endDate).toDate() };
	}

	const crawlLogs = await model.getCrawlLogs(params, condition);
	const totalUrl = await connRedis.get('totalUrl');

	return { ...crawlLogs, totalUrl: Number(totalUrl) };
}
