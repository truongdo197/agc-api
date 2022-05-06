import { ICrawlerMetric } from './metric.interface';
import Metric from '$schema/Metric';
import { ParamsReturnPaging } from '../../../../types/interface/Pagination.definition';
import { makeKeywordConditions, returnPaging } from '$utils/utils';
import escapeStringRegexp from 'escape-string-regexp';
import CrawlLog from '$schema/CrawlLog';
import moment from 'moment';
export async function updateCrawlerMetrics(body: ICrawlerMetric) {
	const crawlerMetrics = { ...body };
	return await Metric.updateOne({}, { crawlerMetrics });
}

export async function getCrawlLogs(params: ParamsReturnPaging, condition) {
	const totalItems = await CrawlLog.countDocuments(condition);
	const crawlLogs = await CrawlLog.find(condition)
		.sort('-createdAt')
		.limit(params.pageSize)
		.skip(params.start)
		.lean();
	return returnPaging(crawlLogs, totalItems, params);
}
