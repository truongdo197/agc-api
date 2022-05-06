import { Document, Schema } from 'mongoose';

export interface ISchemaCity extends Document {
    name: string;
    status: number;
    order: number;
    kenId: Schema.Types.ObjectId;
}
