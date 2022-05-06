import 'reflect-metadata';
import 'module-alias/register';
import 'express-async-errors';
import { cmsRouter } from '$decorator/routeCms.decorator';
import { webRouter } from '$decorator/routeWeb.decorator';
import './feature/v1';
import express from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from 'http';
import logRequest from '$middleware/logRequest';
import log from '$config/log';
import { handleError } from '$utils/response';
import env from '$config/env';
import path from 'path';
import initMongoose from '$config/mongo';
import initSchedule from './config/jobs/schedule';
import initWorker from './config/jobs/Worker';
import { Http2Server } from 'http2';
import socketModule from '$config/socket';
import { updateMetric } from '$feature/v1/cms/elasticsearch/elasticseach.service';
import connRedisCrawler from './config/redisCrawler';
import {
	processCodeMap,
	processSubproductSaiyasune,
} from '$feature/v1/cms/product/subcribeProductServices/product.service';
import config from '$config/env';
import { processMessage } from '$feature/v1/cms/product/subcribeProductServices/subcribeProduct.service';


const logger = log('Index');
const app = express();
const http: Http2Server = createServer(app);
initMongoose();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(logRequest);
app.use(cmsRouter);
app.use(webRouter);
app.use(handleError);
if (config.redisCrawler.enabled === 1) {
	connRedisCrawler.subscribe('subproduct', (err, count) => {});
	connRedisCrawler.subscribe('codemaps', (err, count) => {});
	connRedisCrawler.subscribe('subproduct_saiyasune', (err, count) => {});
	connRedisCrawler.on('message', async (channel, message) => {
		if (channel === 'subproduct') {
			await processMessage(message);
		}
		// bỏ đi
		if (channel === 'codemaps') {
			await processCodeMap(message);
		}
		if (channel === 'subproduct_saiyasune') {
			await processSubproductSaiyasune(message);
		}
	});
}

http.listen(env.port, () => {
	logger.info(`Environment: ${env.environment}`);
	logger.info(`Express server started on port ${env.port}`);
});
const io = socketModule.init(http);
io.on('connection', (client) => {
	logger.info(`Client ID ${client.id} connected`);
});
(async function init() {
	await updateMetric();
	await initSchedule();
	await initWorker();
})();
