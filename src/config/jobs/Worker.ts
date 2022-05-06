import { Worker, Job } from 'bullmq';
import { JobName, QueueName } from '../../types/enum/common';
import log from '../log';
import _ from 'lodash';
import { increaseNumbersOfKeyword } from '$feature/v1/web/product/product.model';
import { handleJobs } from './jobAction';
import { handleNoticeMigrateDataSuccess } from '$socket/socket.notice';
import Bluebird from 'bluebird';
import { ISubProduct } from '$types/interface/Product.definition';
import io from '$config/socket';
import {
	createJobMappingProduct,
	mappingSubProdToProd,
	processAmazonProduct,
} from '$feature/v1/cms/product/product.service';
import {
	syncDataToElasticsearch,
	updateMetric,
	updateDocumentES,
} from '$feature/v1/cms/elasticsearch/elasticseach.service';
import { updateLastTimeMappingSubProduct } from '$feature/v1/cms/product/product.model';
import env from '$config/env';
import {
	handleAsinCode,
	handleJanCode,
	handleJanCodeSaiyasune,
	handleCodesFileItem,
	handleAffiliateUrl,
} from './method';
import { scheduleSyncProductFactory } from '$feature/v1/cms/product/subcribeProductServices/subcribeProduct.service';

const connection = {
	host: env.redis.host,
	port: env.redis.port,
};

const logger = log('Worker');
export default function initWorker() {
	const affUrlWorker = new Worker(
		'HandleAffiliateUrl',
		async (job: Job) => {
			if (job.name === JobName.HANDLE_AFFILIATE_URL) {
				await handleAffiliateUrl(job.data);
				logger.info(
					`Worker handled ${JobName.HANDLE_AFFILIATE_URL} completed. URL: ${job.data.urlProduct}`
				);
			}
		},
		{
			connection,
			limiter: { max: 1, duration: 1000 },
		}
	);
	_.forEach(QueueName, (value, key) => {
		const worker = new Worker(
			value,
			async (job: Job) => {
				if (job.name === JobName.INCREASE_NUMBERS_OF_KEYWORD) {
					await increaseNumbersOfKeyword(job.data);
					logger.info(`${JobName.INCREASE_NUMBERS_OF_KEYWORD} ${job.data} completed!`);
				}
				if (job.name === JobName.SYNC_PRODUCT_FACTORY) {
					await scheduleSyncProductFactory(job.data);
					logger.info(
						`${JobName.SYNC_PRODUCT_FACTORY} with ASIN: ${job.data.asinCode}, JAN: ${job.data.janCode} completed!`
					);
				}
				if (job.name === JobName.MIGRATE_DATA_MONGO_TO_ELASTICSEARCH) {
					await syncDataToElasticsearch(job.data);
					if (job.data.lastPage) {
						handleNoticeMigrateDataSuccess();
						await updateMetric();
					}
					logger.info(
						`${JobName.MIGRATE_DATA_MONGO_TO_ELASTICSEARCH} start from ${job.data.start} completed!`
					);
				}
				if (job.name === JobName.PUT_DATA_MONGO_TO_ELASTICSEARCH) {
					await updateDocumentES(job.data);
					logger.info(
						`${JobName.PUT_DATA_MONGO_TO_ELASTICSEARCH} start from ${job.data} completed!`
					);
				}
				if (job.name === JobName.UPDATE_METRIC) {
					await updateMetric();
					logger.info(`${JobName.UPDATE_METRIC} completed!`);
				}
				if (job.name === JobName.MAPPING_SUBPRODUCT_TO_PRODUCT) {
					await Bluebird.each(job.data.subProducts, async (subProduct: ISubProduct) => {
						await mappingSubProdToProd(subProduct);
					});
					io.getIO().emit('done-mapping', 'Done mapping sub product to product');
					await updateLastTimeMappingSubProduct();
				}
				if (job.name === JobName.PROCESS_AMAZON_PRODUCT) {
					await processAmazonProduct(job.data.amazonSubProducts);
				}
				if (job.name === JobName.ASIN_CODE_URL) {
					await handleAsinCode(job.data);
					logger.info(`Worker handled ${JobName.ASIN_CODE_URL} completed`);
				}
				if (job.name === JobName.JAN_CODE_URL) {
					await handleJanCode(job.data);
					logger.info(`Worker handled ${JobName.JAN_CODE_URL} completed`);
				}
				if (job.name === JobName.JAN_CODE_URL_SAIYASUNE) {
					await handleJanCodeSaiyasune(job.data);
					logger.info(`Worker handled ${JobName.JAN_CODE_URL_SAIYASUNE} completed`);
				}
				if (job.name === JobName.HANDLE_CODES_FILE) {
					await handleCodesFileItem(job.data);
					logger.info(`Worker handled ${JobName.HANDLE_CODES_FILE} completed`);
				}
			},
			{ connection }
		);
		handleJobs(worker);
	});
}
