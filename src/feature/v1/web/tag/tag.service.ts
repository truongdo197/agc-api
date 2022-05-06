import { ITag } from './tag.interface';
import * as model from './tag.model';

export async function getTagById(tagId: string) {
	const taskPromise = [];
	const queryCountDocument = model.countProductByTag(tagId);
	const queryDetailTag = model.getTagById(tagId);
	taskPromise.push(queryCountDocument, queryDetailTag);
	const [totalItems, data] = await Promise.all(taskPromise);
	return { ...data, totalProducts: totalItems };
}

export async function getTagList(params: ITag) {
	return await model.getTagList(params);
}
