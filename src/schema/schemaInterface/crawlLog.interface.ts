import { Document } from 'mongoose';

export interface ISchemaCrawlLog extends Document {
	url: string;
	msg: string;
	createdAt: Date | string;
}
