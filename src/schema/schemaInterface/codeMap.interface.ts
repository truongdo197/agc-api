import { Document, Schema } from 'mongoose';

export interface ISchemaCodeMap extends Document {
	ean: string;
	upc: string;
	asin: string;
	_id: string;
	fullCode: string;
	isProcessed: boolean;
}
