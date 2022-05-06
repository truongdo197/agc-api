import { Client } from '@elastic/elasticsearch';
import log from './log';
import env from '$config/env';

const logger = log('Elasticsearch');

const esClient = new Client({
	node: env.elasticsearch.url,
	requestTimeout: env.elasticsearch.requestTimeout,
	maxRetries: env.elasticsearch.maxRetries,
	auth: {
		username: env.elasticsearch.username,
		password: env.elasticsearch.password,
	},
});

esClient.ping(function (error) {
	if (error) {
		logger.error(error);
	} else {
		logger.info('Elasticsearch connected');
	}
});

export default esClient;
