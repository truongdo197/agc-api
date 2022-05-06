import * as model from './category.model';
import { ICategory } from './category.interface';
import { map, split, filter } from 'lodash';
import SubProduct from '$schema/SubProduct';
import Bluebird from 'bluebird';
import SiteCategory from '../../../../schema/SiteCategory';
import log from '../../../../config/log';
export async function createCategory(params: ICategory) {
	return await model.createCategory(params);
}

export async function getCategoryList(params: ICategory) {
	return await model.getCategoryList(params);
}

export async function deleteCategory(categoryId: string) {
	return await model.deleteCategory(categoryId);
}

export async function updateCategory(categoryId: string, params: ICategory) {
	return await model.updateCategory(categoryId, params);
}

export async function getCategoryById(categoryId: string) {
	return await model.getCategoryById(categoryId);
}

function getCatIndex(categoryUrl: string) {
	const splitUrl = split(categoryUrl, '/');
	const indexes = filter(
		map(splitUrl, (e) => Number(e)),
		(index) => !!index
	);
	return indexes;
}

export async function getSiteCatsBySubProduct() {
	const subProdsGroupByName = await SubProduct.aggregate()
		.unwind('$categories')
		.group({
			_id: '$categories.name',
			url: { $first: '$categories.url' },
			level: { $first: '$categories.index' },
			source: { $first: '$source' },
		});

	let successfulProducts = 0;
	await Bluebird.each(subProdsGroupByName, async (i: any) => {
		const isExist = await SiteCategory.findOne({ name: i._id.trim() });
		if (!isExist) {
			let siteCate = new SiteCategory({ name: i._id.trim(), source: i.source });
			let catIndex = 0;
			if (i.source !== 'Rakuten') {
				catIndex = getCatIndex(i.url)[i.level];
				siteCate.index = catIndex;
			} else {
				catIndex = getCatIndex(i.url)[0];
				siteCate.index = catIndex;
			}
			await siteCate.save();
			successfulProducts += 1;
			log('Category').info(`Index: ${catIndex} has been processed. Number: ${successfulProducts}`);
		}
	});
}
