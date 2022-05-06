import _ from 'lodash';
import WatchingList from '$schema/WatchingList';
import WatchingProduct from '$schema/WatchingProduct';
import { PagingParams } from '$interface/Pagination.definition';
import { returnPaging, getObjectId } from '$utils/utils';
import FavoriteProduct from '$schema/FavoriteProduct';
import { map } from 'lodash';

interface IWatchingProduct {
	product: string;
	watchingList: string;
}

interface IWatchingList {
	name: string;
	member?: string;
	products?: Array<IWatchingProduct>;
}

export async function createWatchingList(body: Pick<IWatchingList, 'name' | 'member'>) {
	const watchingList = new WatchingList({ name: body.name, member: body.member });
	return await watchingList.save();
}

interface IAddProductToWatchingList {
	watchingList: string;
	products: Array<string>;
	memberId: string;
}
export async function addProductToWatchingList(body: IAddProductToWatchingList) {
	const watchingList = await WatchingList.findOne({ _id: body.watchingList });
	watchingList.count = watchingList.count + body.products.length;

	const products = body.products.map((watchingProduct) => ({
		product: watchingProduct,
		watchingList: body.watchingList,
		member: body.memberId,
	}));

	await WatchingProduct.create(products);
	return await watchingList.save();
}

export async function editWatchingList(
	body: IWatchingList,
	watchingListId: string,
	memberId: string
) {
	const name = body.name;
	return await WatchingList.updateOne(
		{ _id: getObjectId(watchingListId), member: getObjectId(memberId) },
		{ name }
	);
}

export async function deleteWatchingList(watchingListId: string, memberId: string) {
	const watchingProducts = await WatchingProduct.find({
		watchingList: getObjectId(watchingListId),
		member: getObjectId(memberId),
	}).populate('product', '_id');
	await FavoriteProduct.deleteMany({
		product: { $in: map(watchingProducts, (watchingProduct) => watchingProduct.product['_id']) },
		member: getObjectId(memberId),
	});
	await WatchingProduct.deleteMany({
		watchingList: getObjectId(watchingListId),
		member: getObjectId(memberId),
	});
	await WatchingList.deleteOne({ _id: getObjectId(watchingListId), member: getObjectId(memberId) });
	return;
}
interface IWatchingListsPaging extends PagingParams {
	memberId: string;
}
export async function getWatchingLists(body: IWatchingListsPaging) {
	const conditions = {
		member: getObjectId(body.memberId),
	};
	const data = await WatchingList.find(conditions)
		.select('count name createdAt')
		.limit(body.pageSize)
		.skip(body.start)
		.sort(body.sort);
	const totalItems = await WatchingList.countDocuments(conditions);
	return returnPaging(data, totalItems, body);
}

export interface IProductsByWatchingListPaging extends PagingParams {
	watchingList: string;
	memberId: string;
}
export async function getListProductByWatchingList(body: IProductsByWatchingListPaging) {
	const conditions = {
		watchingList: getObjectId(body.watchingList),
		member: body.memberId,
	};
	const data = await WatchingProduct.find(conditions)
		.populate('product', 'title minPrice thumbnail images createdAt price')
		.populate('watchingList', 'name')
		.limit(body.pageSize)
		.skip(body.start)
		.sort(body.sort);
	const totalItems = await WatchingProduct.countDocuments(conditions);
	return returnPaging(data, totalItems, body);
}
