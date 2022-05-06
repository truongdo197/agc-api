import { PagingParams } from '$types/interface/Pagination.definition';
import { Schema } from 'mongoose';
export interface IPost {
	title?: string;
	content?: string;
	type?: number;
	image?: string;
	url?: string;
	tag?: Schema.Types.ObjectId;
	category?: Schema.Types.ObjectId;
}

export interface IPostList extends PagingParams {
	type?: number;
	title?: string;
	keyword?: string;
}
