import { Document, Schema } from 'mongoose';

export interface ISchemaVerifieldCode extends Document {
    object: string;
    code: string;
    status: number;
    verifiedDate: Date;
    expiredDate: Date;
}
