import { PointType } from '$enum/common';
import { Document } from 'mongoose';

export interface ISchemaPoint extends Document {
	title: string;
	content: string;
	source: string;
	rate: number;
	pointUrl: string;
	active: boolean;
	options: Array<{ title: string; rate: number }>;
	type: PointType;
}
