import { Document, Schema } from 'mongoose';

export interface ISchemaProductNotiSetting extends Document {
	product: Schema.Types.ObjectId;
	member: Schema.Types.ObjectId;
	valueSetting: number;
	priceExcuted?: number;
	type: string;
	active: boolean;
	valueBeforeChange: number;
}
