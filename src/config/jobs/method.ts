import { handleAffiliateUrlQueue } from './Queue';
import { JobName, RedisCrawlerQueue, SourceProduct } from '$enum/common';
import log from '../log';
import Redis from 'ioredis';
import connRedisUrl from '$config/redisAddUrl';
import { addProductFactory } from '$feature/v1/cms/product/manageCrawlProduct/manageCrawlProduct.service';
import SubProduct from '$schema/SubProduct';
import { addJobs } from './jobAction';
import axios from 'axios';
import env from '$config/env';

const logger = log('method queue');

/**
 * handle asin code url
 */
export async function handleAsinCode(code: string) {
	if (code) {
		const asinCode = assignAsinCodeUrl(code);
		return await pushDataToCrawlerRedis(asinCode, RedisCrawlerQueue.AMAZONE_DETAIL, connRedisUrl);
	}
}

function assignAsinCodeUrl(code: string) {
	return `https://www.amazon.co.jp/dp/${code}`;
}

/**
 * handle jan code url
 */
export async function handleJanCode(code: string) {
	if (code) {
		const janCodeYahoo = assignJanCodeYahooUrl(code);
		const asinCodeRakuten = assignJanCodeRakutenUrl(code);
		await pushDataToCrawlerRedis(janCodeYahoo, RedisCrawlerQueue.YAHOO_SEARCH, connRedisUrl);
		await pushDataToCrawlerRedis(asinCodeRakuten, RedisCrawlerQueue.RAKUTEN_SEARCH, connRedisUrl);
		return;
	}
}

function assignJanCodeYahooUrl(code: string) {
	return `https://shopping.yahoo.co.jp/search?p=${code}`;
}

function assignJanCodeRakutenUrl(code: string) {
	return `https://search.rakuten.co.jp/search/mall/${code}/`;
}

/**
 * handle jan code saiyasune url
 */
export async function handleJanCodeSaiyasune(code: string) {
	const janCode = assignJanCodeSaiyasuneUrl(code);
	return await pushDataToCrawlerRedis(janCode, RedisCrawlerQueue.SAIYASUNE_DETAIL, connRedisUrl);
}

function assignJanCodeSaiyasuneUrl(code: string) {
	return `https://www.saiyasune.com/J${code}.html`;
}

export async function pushDataToCrawlerRedis(
	url: string,
	keyQueue: string,
	connRedisUrl: Redis.Redis
) {
	// await connRedisUrl.lrem(`${keyQueue}:queue`, 0, url);
	// await connRedisUrl.del(`${keyQueue}:queue`);
	return await connRedisUrl.rpush(`${keyQueue}:queue`, url);
}

export async function deleteKeyRedis(connRedisUrl: Redis.Redis) {
	await connRedisUrl.del(`${SourceProduct.AMAZON}:queue`);
	await connRedisUrl.del(`${SourceProduct.YAHOO}:queue`);
	await connRedisUrl.del(`${SourceProduct.RAKUTEN}:queue`);
	return true;
}

/**
 * handle codes file
 */
export async function handleCodesFileItem(item: string) {
	const arr = item.split(',');

	if (!arr[0] || !arr[1]) return;

	const data = {
		title: arr[1].trim(),
		janCode: arr[2].trim(),
		asinCode: arr[3].trim(),
	};

	return await addProductFactory(data);
}

/**
 * handle affiliate url
 */

export async function handleAffiliateUrl(params: any) {
	if (params.source === SourceProduct.RAKUTEN) {
		if (!params?.itemCode) return;
		const responseRakuten = await axios.get(
			`${env.rakuten.rakutenDomain}?format=json&itemCode=${params.store}:${params.itemCode}&affiliateId=${env.rakuten.affiliateId}&applicationId=${env.rakuten.applicationId}`,
			{ timeout: 10000 }
		);
		const affiliateUrl = responseRakuten?.data?.Items[0]?.Item?.affiliateUrl;
		await SubProduct.updateOne(
			{ _id: params._id, source: params.source, itemCode: params.itemCode, active: true },
			{ affiliateUrl }
		);
		return;
	}

	if (params.source === SourceProduct.YAHOO || params.source === SourceProduct.PAYPAY) {
		const data = params.urlProduct.split('?');
		const encodeUrl = encodeURIComponent(data[0]);
		const sid = 3579193;
		const pid = 887079474;
		const affiliateUrl = `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodeUrl}`;
		await SubProduct.updateOne(
			{ _id: params._id, source: params.source, active: true },
			{ affiliateUrl }
		);
		return;
	}

	if (params.source === SourceProduct.AMAZON) {
		const affiliateUrl = `${params.urlProduct}?tag=a0997-22&linkCode=osi&th=1&psc=1`;
		await SubProduct.updateOne(
			{ _id: params._id, source: params.source, active: true },
			{ affiliateUrl }
		);
		return;
	}
	return;
}

export async function cronjobAffiliateUrl() {
	const products = await SubProduct.find({});
	for (let i = 0; i < products.length; i++) {
		await addJobs(handleAffiliateUrlQueue, JobName.HANDLE_AFFILIATE_URL, products[i]);
	}
	return;
}

export async function addAffiliateUrlForSubProduct(urlProduct: string) {
	const subProd = await SubProduct.findOne({ urlProduct });
	await addJobs(handleAffiliateUrlQueue, JobName.HANDLE_AFFILIATE_URL, subProd);
}
