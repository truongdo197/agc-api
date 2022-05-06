import { Document } from 'mongoose';

export interface ISchemaMetric extends Document {
	totalProductsMongo: number;
	totalSubProductsElasicsearch: number;
	lastTimeUpdateProduct: Date;
	totalSubProductsMongo: number;
	dailyTokensLeft: number;
	bucketSize: number;
	crawlerMetrics: {
		totalUrl: number;
		succeededUrl: number;
		failedUrl: number;
	};
}
