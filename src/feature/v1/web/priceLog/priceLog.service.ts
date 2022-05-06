import PriceLog from '$schema/PriceLog';
import { getObjectId } from '$utils/utils';
import moment from 'moment';
import { map, forEach, groupBy, values, minBy, get, sumBy } from 'lodash';
import SubProduct from '$schema/SubProduct';
import Product from '$schema/Product';
import { ErrorCode } from '$enum/common';
// '1month' | '3months' | '1year' | '2years'
export async function getPriceLogs(productId: string, range: string) {
	const countPriceLog = await PriceLog.countDocuments({ product: getObjectId(productId) });
	const product = await Product.findById(getObjectId(productId)).select('price');
	if (!product) {
		throw ErrorCode.Not_Found;
	}
	if (!countPriceLog) {
		const subProds = await SubProduct.find({
			productId: getObjectId(productId),
		});
		const subProdMinPrice: any = minBy(subProds, 'price');
		const priceLog = new PriceLog({
			product: getObjectId(productId),
			oldPrice: 0,
			newPrice: product.price,
			store: get(subProdMinPrice, 'store', ''),
			averagePrice: sumBy(subProds, 'price') / subProds.length,
			storeUrl: subProdMinPrice.urlProduct,
		});
		await priceLog.save();
	}
	const query = PriceLog.find({ product: getObjectId(productId) });
	if (range === '1month') {
		query.where({
			createdAt: {
				$gte: moment().subtract(1, 'month').toDate(),
				$lte: moment().toDate(),
			},
		});
	}
	if (range === '3months') {
		query.where({
			createdAt: {
				$gte: moment().subtract(3, 'month').toDate(),
				$lte: moment().toDate(),
			},
		});
	}
	if (range === '1year') {
		query.where({
			createdAt: {
				$gte: moment().subtract(1, 'year').toDate(),
				$lte: moment().toDate(),
			},
		});
	}
	if (range === '2years') {
		query.where({
			createdAt: {
				$gte: moment().subtract(2, 'year').toDate(),
				$lte: moment().toDate(),
			},
		});
	}
	const priceLogs = await query.sort('createdAt').lean().exec();

	const priceLogsGroupByCreatedAt = groupBy(priceLogs, (priceLog) =>
		moment(priceLog.createdAt).format('YYYY-MM-DD')
	);
	const valuesOfPriceLogsGroup = values(priceLogsGroupByCreatedAt);
	const priceLogsMinByDate = map(valuesOfPriceLogsGroup, (priceLogs) => {
		return minBy(priceLogs, 'newPrice');
	});
	return priceLogsMinByDate;
}
