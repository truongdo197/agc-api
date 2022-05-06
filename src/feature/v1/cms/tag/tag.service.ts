import { ITag } from './tag.interface';
import * as model from './tag.model';
import { productsWithCategoryName } from './tag.model';
import Bluebird from 'bluebird';
import SiteCategory from '../../../../schema/SiteCategory';
import Product from '$schema/Product';
import log from '$config/log';
export async function createTag(params: ITag) {
	return await model.createTag(params);
}

export async function getTagById(tagId: string) {
	return await model.getTagById(tagId);
}

export async function getTagList(params: ITag) {
	return await model.getTagList(params);
}

export async function deleteTag(tagId: string) {
	return await model.deleteTag(tagId);
}

export async function updateTag(tagId: string, params: ITag) {
	return await model.updateTag(tagId, params);
}

export async function getListSiteCats(keyword: string) {
	return await model.getListSiteCats(keyword);
}

export async function unlinkSiteCat(index: number) {
	return await model.unlinkSiteCat(index);
}

export const synchronizeTag = async () => {
	const products = await productsWithCategoryName();
	await Bluebird.each(products, async (product: any) => {
		const siteCat = await SiteCategory.findOne({
			name: { $in: product.categories },
			$or: [{ tag: { $exists: true } }, { tag: { $ne: null } }],
		});
		if (siteCat && siteCat.tag !== null) {
			await Product.updateOne({ _id: product._id }, { tag: siteCat.tag });
			log('Tag').info('Product ID: ' + product._id + ' processed!');
		}
	});
};
