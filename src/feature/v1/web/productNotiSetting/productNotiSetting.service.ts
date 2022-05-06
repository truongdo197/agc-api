import ProductNotiSetting from '$schema/ProductNotiSetting';
import { getObjectId } from '$utils/utils';
import { assignIn, map, get, minBy, sumBy } from 'lodash';
import Product from '$schema/Product';
import SubProduct from '$schema/SubProduct';
import { ProductNotiSettingType, ErrorCode } from '$enum/common';
import { IProduct } from '$types/interface/Product.definition';
import Notification from '$schema/Notification';
import PriceLog from '$schema/PriceLog';
interface IProductSettingNoti {
	product: string;
	valueSetting: number;
	type: string;
	active: boolean;
}
export async function singleSettingNotiForProduct(member: string, body: IProductSettingNoti) {
	const productSettingNoti = await ProductNotiSetting.findOne({
		product: getObjectId(body.product),
		member: getObjectId(member),
		type: body.type,
	});
	const product = await Product.findOne({ _id: body.product }).select('price');
	if (!product) throw ErrorCode.Not_Found;
	const productPrice = get(product, 'price', 0);
	const priceExcuted = productPrice - (productPrice * body.valueSetting) / 100;
	if (!productSettingNoti) {
		return await ProductNotiSetting.create({
			product: body.product,
			member: member,
			type: body.type,
			active: body.active,
			priceExcuted: body.type === ProductNotiSettingType.PERCENT ? priceExcuted : null,
			valueSetting: body.valueSetting,
			valueBeforeChange: productPrice,
		});
	}
	assignIn(productSettingNoti, {
		...body,
		valueBeforeChange: productPrice,
		priceExcuted: body.type === ProductNotiSettingType.PERCENT ? priceExcuted : null,
		active: body.active,
	});
	await productSettingNoti.save();
	return productSettingNoti;
}

export async function notiForSettingPrice(newProduct: IProduct, next) {
	const oldProduct = await Product.findOne({ _id: newProduct._id });
	if (!oldProduct) {
		return next();
	}
	if (newProduct?.price === oldProduct?.price) {
		return next();
	}
	const lteSettings = await ProductNotiSetting.find({
		valueSetting: { $gte: newProduct['price'] },
		type: ProductNotiSettingType.PRICE,
		active: true,
		product: newProduct._id,
	});

	const notifications = map(lteSettings, (setting) => {
		return {
			product: setting.product,
			valueSetting: setting.valueSetting,
			member: setting.member,
			valueAfterChange: newProduct['price'],
			content: `${newProduct['title']}の最安値は設定した金額の￥${newProduct['price']}に変動しました。`,
			title: `最安値が￥${newProduct['price']}に変動した！`,
		};
	});
	await Notification.create(notifications);
}

export async function detectPriceChange(newProduct: IProduct, next) {
	const oldProduct = await Product.findOne({ _id: newProduct._id });
	if (!oldProduct) {
		return next();
	}
	if (!newProduct?.price || !oldProduct?.price) return next();

	if (newProduct?.price !== oldProduct?.price) {
		const subProds = await SubProduct.find({
			productId: newProduct._id,
		});
		const subProdMinPrice: any = minBy(subProds, 'price');
		const priceLog = new PriceLog({
			product: oldProduct._id,
			oldPrice: oldProduct.price,
			newPrice: newProduct.price,
			store: get(subProdMinPrice, 'store', ''),
			averagePrice: sumBy(subProds, 'price') / subProds.length,
			storeUrl: subProdMinPrice.urlProduct,
		});
		await priceLog.save();
	}
}

export async function nofiForSettingPercent(newProduct: IProduct, next) {
	const oldProduct = await Product.findOne({ _id: newProduct._id });

	if (!oldProduct) {
		return next();
	}

	if (newProduct?.price === oldProduct?.price) {
		return next();
	}
	const lteSettings = await ProductNotiSetting.find({
		priceExcuted: { $gte: newProduct['price'] },
		type: ProductNotiSettingType.PERCENT,
		active: true,
		product: newProduct._id,
	});

	const notifications = map(lteSettings, (setting) => {
		return {
			product: setting.product,
			valueSetting: setting.valueSetting,
			member: setting.member,
			valueAfterChange: newProduct['price'],
			content: `${newProduct['title']}の最安値は設定した金額の￥${setting.valueSetting}%に変動しました。`,
			title: `最安値が￥${setting.valueSetting}%に変動した！`,
		};
	});
	await Notification.create(notifications);
}

export async function doubleSettingNotiForProduct(memberId, body: Array<IProductSettingNoti>) {
	const settingNotifications = await Promise.all([
		singleSettingNotiForProduct(memberId, body[0]),
		singleSettingNotiForProduct(memberId, body[1]),
	]);
	return settingNotifications;
}

export async function getDetailProductNotiSetting(member: string, product: string) {
	const subProductMinPrice = await SubProduct.findOne({ productId: getObjectId(product) })
		.populate('productId', 'title createdAt price favoriteNumber thumbnail')
		.sort('price')
		.select('reviewsSummary productId');
	const productNotiSettings = await ProductNotiSetting.find({
		member: getObjectId(member),
		product: getObjectId(product),
	}).select('type valueSetting valueBeforeChange active');

	return {
		product: {
			favoriteNumber: subProductMinPrice.productId['favoriteNumber'],
			_id: subProductMinPrice.productId['_id'],
			title: subProductMinPrice.productId['title'],
			thumbnail: subProductMinPrice.productId['thumbnail'],
			price: subProductMinPrice.productId['price'] || subProductMinPrice.price,
			reviewsSummary: subProductMinPrice.reviewsSummary,
			createdAt: subProductMinPrice.productId['createdAt'],
		},
		productNotiSettings,
	};
}
