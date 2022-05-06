import _ from 'lodash';
import WatchingList from '$schema/WatchingList';
import WatchingProduct from '$schema/WatchingProduct';
import { PagingParams } from '$interface/Pagination.definition';
import { returnPaging, getObjectId } from '$utils/utils';
import FavoriteProduct from '$schema/FavoriteProduct';
import Product from '$schema/Product';
import { uniqBy, map } from 'lodash';
import {
	addProductToWatchingList,
	getListProductByWatchingList,
	IProductsByWatchingListPaging,
} from '../watchingList/watchingList.service';

interface IAddProductToFavorite {
	productId: string;
	watchingList: string;
}
export async function addProductToFavorite(memberId: string, body: IAddProductToFavorite) {
	const favoriteProductExisted = await FavoriteProduct.findOne({
		product: getObjectId(body.productId),
		member: getObjectId(memberId),
	});
	const productExistedInWatchingList = await WatchingList.findOne({
		product: getObjectId(body.productId),
		watchingList: getObjectId(body.watchingList),
	});
	if (favoriteProductExisted && productExistedInWatchingList) {
		return favoriteProductExisted;
	}
	const product = await Product.findOne({ _id: getObjectId(body.productId) });
	product.favoriteNumber += 1;
	await product.save();
	const favoriteProduct = new FavoriteProduct({
		member: getObjectId(memberId),
		product: getObjectId(body.productId),
	});
	const bodyOfAddProductToWatchingList = {
		watchingList: body.watchingList,
		products: [body.productId],
		memberId,
	};
	await addProductToWatchingList(bodyOfAddProductToWatchingList);
	return await favoriteProduct.save();
}

export async function unmarkAsFavorite(memberId: string, productId: string) {
	const product = await Product.findOne({ _id: getObjectId(productId) });
	const watchingProducts = await WatchingProduct.find({
		product: getObjectId(product),
		member: getObjectId(memberId),
	});

	product.favoriteNumber = product.favoriteNumber > 0 ? product.favoriteNumber - 1 : 0;
	await Promise.all([
		await WatchingList.updateMany(
			{
				_id: map(watchingProducts, (item) => getObjectId(item.watchingList)),
			},
			{ $inc: { count: -1 } }
		),
		product.save(),
		WatchingProduct.deleteMany({
			product: getObjectId(productId),
			member: getObjectId(memberId),
		}),
		FavoriteProduct.deleteMany({
			product: getObjectId(productId),
			member: getObjectId(memberId),
		}),
	]);
	return;
}

interface IFavoriteProductPaging extends PagingParams {
	watchingList?: string;
}

export async function getListFavoriteProduct(memberId: string, body: IFavoriteProductPaging) {
	const conditions = {
		member: getObjectId(memberId),
	};
	if (!body.watchingList) {
		const data = await FavoriteProduct.find(conditions)
			.select('product createdAt')
			.populate('product', 'title minPrice images thumbnail createdAt price')
			.limit(body.pageSize)
			.skip(body.start)
			.sort(body.sort);
		const totalItems = await FavoriteProduct.countDocuments(conditions);
		return returnPaging(data, totalItems, body);
	}
	if (body.watchingList) {
		return await getListProductByWatchingList({
			...body,
			watchingList: getObjectId(body.watchingList),
			memberId: getObjectId(memberId),
		} as IProductsByWatchingListPaging);
	}
	return;
}
