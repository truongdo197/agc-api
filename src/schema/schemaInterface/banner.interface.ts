import { Document } from 'mongoose';

export interface ISchemaBanner extends Document {
	typeBanner: number;
	url: string;
	image: string;
	content: string;
	active: boolean;
	price: number;
	position: number;
}
