import mongoose, { Schema } from 'mongoose';
import { ISchemaMetric } from './schemaInterface/metric.interface';
import { ModelName } from '$enum/common';

const schema = new Schema(
	{
		totalProductsMongo: { type: Number, required: true },
		totalSubProductsElasicsearch: { type: Number, default: true },
		totalSubProductsMongo: { type: Number, default: true },
		lastTimeUpdateProduct: { type: Date },
		dailyTokensLeft: { type: Number, default: 1 },
		bucketSize: { type: Number, default: 1 },
		crawlerMetrics: {
			totalUrl: { type: Number, default: 0 },
			succeededUrl: { type: Number, default: 0 },
			failedUrl: { type: Number, default: 0 },
		},
	},
	{ timestamps: true }
);
const Metric = mongoose.model<ISchemaMetric>(ModelName.METRIC, schema);

export default Metric;
