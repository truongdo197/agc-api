require('dotenv').config();
import { get } from 'lodash';
export default {
	enableSchedule: Number(process.env.ENABLE_SCHEDULE) || 2, // 1: on, 2: off
	environment: process.env.NODE_ENV,
	port: process.env.NODE_PORT || 3000,
	asinScopeKey: process.env.ASIN_SCOPE_KEY,
	webDomain: process.env.WEB_DOMAIN,
	crawlDomain: process.env.CRAWL_DOMAIN,
	// instanceSnapshotName: process.env.INSTANCE_SNAPSHOT_NAME,
	instanceSnapshotRakutenName: process.env.INSTANCE_SNAPSHOT_RAKUTEN_NAME,
	instanceSnapshotAmazonYahooName: process.env.INSTANCE_SNAPSHOT_AMAZON_YAHOO_NAME,
	auth: {
		tokenWeb: process.env.TOKEN_WEB,
		tokenCms: process.env.TOKEN_CMS,
		tokenRefreshWeb: process.env.TOKEN_REFRESH_WEB,
		tokenRefreshCms: process.env.TOKEN_REFRESH_CMS,
		saltRounds: process.env.SALT_ROUNDS,
		tokenClientExpire: 5, //
		tokenExpire: 24 * 60 * 60, //1ngay
		refreshExpire: 105120000 * 60, // 1 tram nam
		tokenVerifyCodeExpire: 10 * 60, // 10 phut,
		verifiedCodeExpired: 60 * 60, // 1 gio
	},
	redisCrawler: {
		enabled: Number(process.env.ENABLE_CRAWLER) || 2, //2 tat, 1 mo,
		port: Number(process.env.CRAWLER_PORT) || 6379,
		host: process.env.CRAWLER_HOST || '35.72.64.130',
		password: process.env.PASSWORD || 'amela123',
	},
	redis: {
		port: Number(process.env.REDIS_PORT),
		host: process.env.REDIS_HOST,
		password: process.env.REDIS_PASSWORD || '',
	},
	mongo: {
		dbName: process.env.DB_NAME_MONGO,
		user: get(process.env, 'DB_USER_MONGO', ''),
		password: get(process.env, 'DB_PASS_MONGO', ''),
		url: `mongodb://${process.env.DB_HOST_MONGO}:${process.env.DB_PORT_MONGO}`,
	},
	noImageLink: process.env.NO_IMAGE_LINK,
	elasticsearch: {
		url: `${process.env.DB_ELASTICSEARCH_PROTOCOL}://${process.env.DB_ELASTICSEARCH_HOST}:${Number(
			process.env.DB_ELASTICSEARCH_PORT
		)}`,
		indexName: process.env.DB_ELASTICSEARCH_INDEX_NAME,
		requestTimeout: 60000,
		maxRetries: 5,
		username: process.env.DB_ELASTICSEARCH_USER,
		password: process.env.DB_ELASTICSEARCH_PASSWORD,
	},
	sendgrid: {
		apiKey: process.env.SENDGRID_API_KEY,
		address: process.env.SENDGRID_ADDRESS_EMAIL,
		fromName: process.env.SENDGRID_FROM_NAME,
	},
	awsUpload: {
		domain: process.env.AWS_DOMAIN,
		downloadUrlThumb: process.env.AWS_DOWNLOAD_URL_THUMB,
		downloadUrl: process.env.AWS_DOWNLOAD_URL,
		secretAccessKey: process.env.AWS_SECRET_ACCESSKEY,
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		region: process.env.AWS_REGION,
		bucket: process.env.AWS_BUCKET,
	},
	rakuten: {
		affiliateId: process.env.RAKUTEN_AFFILIATE_ID || '1fc1f89d.5c1944d8.1fc1f89e.57e859ff',
		applicationId: process.env.RAKUTEN_APPLICATION_ID || '1025669687650931378',
		rakutenDomain:
			process.env.RAKUTEN_DOMAIN ||
			'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706',
	},
};
