import { Document } from 'mongoose';

export interface ISchemaKen extends Document {
    name: string;
    status: number;
    order: number;
    createdBy: number;
}
