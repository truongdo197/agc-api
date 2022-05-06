import mongoose, { Schema } from 'mongoose';
import { ISchemaPoint } from './schemaInterface/point.interface';
import { ModelName, SourceProduct } from '$enum/common';
import { PointType } from '../types/enum/common';

const schema = new Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: false },
		source: { type: String, required: true },
		rate: { type: Number },
		active: { type: Boolean, default: true },
		pointUrl: { type: String, required: true },
		options: [
			{
				title: String,
				rate: Number,
			},
		],
		type: { type: Number, enum: Object.values(PointType) },
	},
	{ timestamps: true }
);
const Point = mongoose.model<ISchemaPoint>(ModelName.POINT, schema);

export default Point;
