import mongoose, { Schema } from 'mongoose';
import { ModelName } from '$enum/common';
import { ISchemaWatchingList } from './schemaInterface/watchingList.interface';

const schema = new Schema(
	{
		name: { type: String, required: true },
		member: { type: Schema.Types.ObjectId, ref: ModelName.MEMBER, required: true },
		count: { type: Number, default: 0 },
	},
	{ timestamps: true }
);
const WatchingList = mongoose.model<ISchemaWatchingList>(ModelName.WATCHING_LIST, schema);

export default WatchingList;
