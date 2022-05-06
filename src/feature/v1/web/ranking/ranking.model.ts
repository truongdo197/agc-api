import Ranking from '$schema/Ranking';
import { IRanking } from './ranking.interface';
import { findLastIndex, forEach, get } from 'lodash';
import SubProduct from '$schema/SubProduct';
export async function getParentCategories(source: string) {
	const categories = await Ranking.find({
		parent_id: { $exists: false },
		source: source,
	}).select(['name', 'category_id']);
	const diyCats = categories.filter((cat) => /DIY/.test(cat.name));

	const categoriesWithoutDIY = categories.filter((cat) => !/DIY/.test(cat.name));

	return [...diyCats, ...categoriesWithoutDIY];
}

export async function getDetailRanking(categoryId?: string, source?: string) {
	if (!categoryId) {
		const categoryDIYPromise = Ranking.findOne({
			source,
			name: /DIY/,
			parent_id: { $exists: false },
		});
		const categoryPromise = Ranking.findOne({
			source,
			parent_id: { $exists: false },
		});
		const [diyCat, normalCat] = await Promise.all([categoryDIYPromise, categoryPromise]);
		const category = diyCat ? diyCat : normalCat;
		const childrenCategories = await Ranking.find({
			parent_id: get(category, 'category_id', ''),
		}).select(['name', 'category_id']);

		if (category?.category_id) {
			const existProducts = await SubProduct.find({
				rankingCategoryId: category.category_id,
				productId: { $ne: null },
				active: true,
			});

			if (existProducts.length) {
				forEach(existProducts, (product) => {
					const index = findLastIndex(category.ranking_products, { url: product.urlProduct });
					if (index > -1) {
						category.ranking_products[index]['productId'] = product.productId;
					}
				});
			}
		}
		return { category, childrenCategories };
	}

	let category = await Ranking.findOne({ category_id: categoryId }).lean();
	if (category?.category_id) {
		const existProducts = await SubProduct.find({
			rankingCategoryId: category.category_id,
			productId: { $ne: null },
			active: true,
		});

		if (existProducts.length) {
			forEach(existProducts, (product) => {
				const index = findLastIndex(category.ranking_products, { url: product.urlProduct });
				if (index > -1) {
					category.ranking_products[index]['productId'] = product.productId;
				}
			});
		}
	}
	const childrenCategories = await Ranking.find({ parent_id: categoryId }).select([
		'name',
		'category_id',
	]);

	return { category, childrenCategories };
}

export async function getDetailRankingFilter(params) {
	const conditions = {};
	if (params.categoryId) conditions['category_id'] = params.categoryId;
	if (params.source) conditions['source'] = params.source;
	const conditionProduct = {};
	if (params.price) conditionProduct['ranking_products.price'] = { $gte: Number(params.price) };
	console.log(conditionProduct);
	const ranking = await Ranking.aggregate()
		.match(conditions)
		.limit(1)
		.unwind('$ranking_products')
		.match(conditionProduct);

	return ranking;
}
