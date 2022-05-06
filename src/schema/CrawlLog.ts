import mongoose, { Schema } from 'mongoose';
import { ModelName } from '../types/enum/common';
import { ISchemaCrawlLog } from './schemaInterface/crawlLog.interface';
import moment from 'moment';

const schema = new Schema({
	url: String,
	createdAt: { type: Date, default: moment().toDate() },
	msg: String,
});

const CrawlLog = mongoose.model<ISchemaCrawlLog>(ModelName.CRAWL_LOG, schema);

export default CrawlLog;
