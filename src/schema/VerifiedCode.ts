import mongoose, { Schema } from 'mongoose';
import { ISchemaUser } from './schemaInterface/user.interface'
import { ModelName, VerifiedCodeStatus } from '$enum/common';
import { ISchemaVerifieldCode } from './schemaInterface/verifiedCode.interface';

const schema = new Schema(
    {
        object: { type: String, required: true, minlength: 1, maxlength: 255 },
        code: { type: String, required: true, minlength: 1, maxlength: 20 },
        status: { type: Number, enum: Object.values(VerifiedCodeStatus), default: 1 },
        verifiedDate: { type: Date, default: new Date() },
        expiredDate: { type: Date }
    },
    { timestamps: true }
);
const VerifieldCode = mongoose.model<ISchemaVerifieldCode>(ModelName.VERIFIEDCODE, schema);

export default VerifieldCode;
