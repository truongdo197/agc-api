import { PagingParams } from '$types/interface/Pagination.definition';
export interface ICategory extends PagingParams {
	keyword?: string;
	name?: string;
	image?: string;
	description?: string;
	shortDescription: string;
}
