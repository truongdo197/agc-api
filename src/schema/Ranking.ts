import mongoose, { Schema } from 'mongoose';
import { ISchemaPoint } from './schemaInterface/point.interface';
import { ModelName } from '$enum/common';
import { SourceProduct } from '../types/enum/common';
import { ISchemaRanking } from './schemaInterface/ranking.interface';

const schema = new Schema(
	{
		parent_id: { type: String },
		category_id: { type: String },
		name: { type: String },
		rate: { type: Number },
		source: { type: String, enum: Object.values(SourceProduct) },
		url: { type: String },
		ranking_products: {
			type: [
				{
					title: String,
					price: Number,
					rank: Number,
					url: { type: String },
					image: String,
				},
			],
		},
	},
	{ timestamps: true, collection: 'ranking' }
);
const Ranking = mongoose.model<ISchemaRanking>(ModelName.RANKING, schema);

export default Ranking;
