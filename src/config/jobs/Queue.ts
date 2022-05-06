import { Queue, QueueScheduler } from 'bullmq';
import env from '$config/env';
import { QueueName } from '$enum/common';
const connection = {
	host: env.redis.host,
	port: env.redis.port,
};

export const productQueue = new Queue(QueueName.PRODUCT, {
	connection,
});

export const actionQueue = new Queue(QueueName.ACTION, {
	connection,
});

export const asinCodeQueueScheduler = new QueueScheduler(QueueName.ASIN_CODE, { connection });

export const asinCodeQueue = new Queue(QueueName.ASIN_CODE, {
	connection,
});

export const asinCodeUrlQueue = new Queue(QueueName.ASIN_CODE_URL, {
	connection,
});

export const janCodeUrlQueue = new Queue(QueueName.JAN_CODE_URL, {
	connection,
});

export const janCodeUrlSaiyasuneQueue = new Queue(QueueName.JAN_CODE_URL_SAIYASUNE, {
	connection,
});

export const handleCodesFileQueue = new Queue(QueueName.HANDLE_CODES_FILE, {
	connection,
});

export const handleAffiliateUrlQueueScheduler = new QueueScheduler('HandleAffiliateUrl', {
	connection,
});
export const handleAffiliateUrlQueue = new Queue('HandleAffiliateUrl', {
	connection,
});
