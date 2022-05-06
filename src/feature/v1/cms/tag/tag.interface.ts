import { Schema } from 'mongoose';
import { PagingParams } from '$types/interface/Pagination.definition';
export interface ITag extends PagingParams {
	name?: string;
	image?: string;
	category?: Schema.Types.ObjectId;
	shortDescription: string;
	description: string;
	keyword: string;
	siteCategories: Schema.Types.ObjectId[];
}
