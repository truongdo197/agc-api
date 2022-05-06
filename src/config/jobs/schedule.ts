import log from '$config/log';
import env from '$config/env';
import * as schedule from 'node-schedule';
import {
	addJobMigrateMongoToElasticsearch,
	addJobUpdateMetric,
} from '$feature/v1/cms/elasticsearch/elasticseach.service';
import {
	createJobGetAmazonProduct,
	createJobMappingAmazonToProduct,
	createJobMappingProduct,
	createNewCrawlers,
	recrawlAfterLongTime,
	recrawlSubProduct,
	removeAllCrawler,
	removeAllProductNoSub,
	updateMinPriceOfProduct,
	createInstancesRanking,
	removeInstancesRanking
} from '$feature/v1/cms/product/product.service';
import { getSiteCatsBySubProduct } from '$feature/v1/cms/category/category.service';
import { synchronizeTag } from '../../feature/v1/cms/tag/tag.service';
import { getTotalUrlsCrawled } from '$feature/v1/cms/metric/metric.service';
import { cronjobAffiliateUrl } from './method';
import { createJobSyncProductFactory } from '$feature/v1/cms/product/subcribeProductServices/subcribeProduct.service';
import { recrawlRanking } from '$feature/v1/cms/ranking/ranking.service';
import { RecrawlType } from '$enum/common';
const logger = log('Schedule');
export default function initSchedule(force = false) {
	if (env.enableSchedule === 2 && !force) return;
	// const tk = require('timekeeper');
	// const date = new Date('2020-10-19T23:59:59+07:00'); //fake time
	// tk.travel(date);
	logger.info('Scheduled has been initialized!');
	schedule.scheduleJob('0 0 0  * * *', async function () {
		logger.info('Schedule migrate data from Mongo to Elasticsearch ');
		await addJobMigrateMongoToElasticsearch();
	});
	schedule.scheduleJob('*/1 * * * *', async function () {
		logger.info('Schedule update metric data mongo and elasticsearch ');
		await addJobUpdateMetric();
	});

	schedule.scheduleJob('*/30 * * * * *', async function () {
		logger.info('Tracking crawler');
		await getTotalUrlsCrawled();
	});

	// schedule.scheduleJob('0 3,12 * * *', async function () {
	// 	logger.info('Sync Product Factory');
	// 	await createJobSyncProductFactory();
	// });
	// schedule.scheduleJob('0 0 12 * *', async function () {
	// 	logger.info('Mapping product ');
	// 	await createJobMappingProduct();
	// });
	schedule.scheduleJob('*/1 * * * *', async function () {
		logger.info('Create Code Map From Asin Code');
		await createJobGetAmazonProduct();
	});

	schedule.scheduleJob('*/30 * * * *', async function () {
		logger.info('Create mapping Amazon to Product');
		await createJobMappingAmazonToProduct();
	});

	schedule.scheduleJob('0 23 * * *', async function () {
		logger.info('Synchronize SiteCat by SubProduct');
		getSiteCatsBySubProduct();
	});

	schedule.scheduleJob('07 15 * * *', async function () {
		logger.info('Recrawl subProduct');
		recrawlSubProduct(RecrawlType.SCHEDULED);
	});

	// tạo DB cho ranking, đẩy vào queue redis
	schedule.scheduleJob('0 1 * * SUN', async function () {
		logger.info('Add list queue to crawl ranking');
		recrawlRanking();
	});

	// tạo các instance ranking (yahoo_ranking, amazon_ranking, rakuten_ranking)
	schedule.scheduleJob('0 1 * * SUN', async function () {
		logger.info('Create instances lightsail to crawl ranking');
		createInstancesRanking();
	});

	// xóa các instance ranking vì chỉ dùng 1 tuần 1 lần
	schedule.scheduleJob('0 1 * * MON', async function () {
		logger.info('Remove all instances lightsail ranking');
		removeInstancesRanking();
	});

	schedule.scheduleJob('07 15 * * *', async function () {
		logger.info('Remove All Crawler');
		await removeAllCrawler();
	});

	schedule.scheduleJob('07 15 * * *', async function () {
		logger.info('Create New Crawlers');
		await createNewCrawlers();
	});

	schedule.scheduleJob('10 15 * * *', async function () {
		logger.info('Create New Crawlers for Product Factory after long time');
		await recrawlAfterLongTime();
	});

	// schedule.scheduleJob('0 */1 * * * *', async () => {
	// 	logger.info('Remove all product no sub');
	// 	const result = await removeAllProductNoSub();
	// 	logger.info(`Product counts deleted: ${result.deletedCount}`);
	// });
	// schedule.scheduleJob('0 */1 * * * *', async () => {
	// 	logger.info('Update min price product');
	// 	await updateMinPriceOfProduct();
	// });

	// schedule.scheduleJob('0 1,3,5,12,14,22 * * *', async function () {
	// 	logger.info('Synchorize Tag');
	// 	await synchronizeTag();
	// });

	// schedule.scheduleJob('*/30 * * * *', async function () {
	// 	logger.info('Affiliate Link');
	// 	await cronjobAffiliateUrl();
	// });
}
