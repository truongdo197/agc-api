import { Document, Schema } from 'mongoose';

export interface ISchemaSaleCampaign extends Document {
	title: string;
	image: string;
	url: string;
	startDate: Date;
	endDate: Date;
	active: boolean;
	store: string;
	discount: string;
	source: string;
}
