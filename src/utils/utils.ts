import { Request, Response, NextFunction } from 'express';
import { ParamsReturnPaging } from '$interface/Pagination.definition';
import { CodeType, Sort, SourceProduct } from '../types/enum/common';
import _, { capitalize, last, lowerCase, upperCase } from 'lodash';
import format from 'string-format';
import mongoose from 'mongoose';
import env from '$config/env';
import { Schema } from 'mongoose';
import escapeStringRegexp from 'escape-string-regexp';

export const executeRequest = (method) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		// Thuc thi phuong thuc xu ly request
		method(req, res, next);
	};
};

export function setDataPaging(params: any) {
	params.pageIndex = Number(params.pageIndex) || 1;
	params.pageSize = Number(params.pageSize) || 10;
	params.start = (params.pageIndex - 1) * params.pageSize;
	params.sort = params.sort === Sort.ASC ? 'createdAt' : '-createdAt';
	return params;
}

export function makeKeywordConditions(keyword: string) {
	return [
		new RegExp(escapeStringRegexp(lowerCase(keyword))),
		new RegExp(escapeStringRegexp(upperCase(keyword))),
		new RegExp(escapeStringRegexp(keyword)),
		new RegExp(escapeStringRegexp(capitalize(keyword))),
	];
}

export function genUrlReview(subProd) {
	switch (subProd.source) {
		case 'Amazon':
			if (!_.get(subProd, 'sku', false)) return;
			return `https://www.amazon.co.jp/product-reviews/${subProd.sku}/`;
		case 'Rakuten':
			break;
		case 'Yahoo':
			if (!_.get(subProd, 'code.value', false)) return;
			return `https://shopping.yahoo.co.jp/product/j/${subProd.code.value}/review.html`;
		default:
			return '';
	}
}
export function returnPaging(
	data: Object[],
	totalItems?: number,
	params?: ParamsReturnPaging,
	dataPaging: Object = {}
) {
	const result = {
		data,
		totalItems,
		totalPages: Math.ceil(totalItems / params.pageSize),
		pageIndex: params.pageIndex,
		paging: true,
		...dataPaging,
	};

	if (!dataPaging) return result;

	return result;
}

export function getCodeType(code: string) {
	const regexMap = [
		{
			regex: /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/,
			codeType: CodeType.ISBN,
		},
		{
			regex: /^(45|49)[0-9]{11}$/,
			codeType: CodeType.JAN_CODE,
		},
	];
	const matchRegex = _.find(regexMap, (elem) => elem.regex.test(code));
	return matchRegex ? matchRegex.codeType : CodeType.UNKNOW;
}

export function getObjectId(obj) {
	const id = _.get(obj, '_id') || obj;
	if (_.isString(id) && mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
	return id;
}

export function awsGetThumb(img: any, size: any) {
	if (img && img != '' && !img.startsWith('http') && !img.startsWith('https'))
		return size === ''
			? format('{0}/{1}', env.awsUpload.downloadUrlThumb, img)
			: format('{0}/{1}/{2}', env.awsUpload.downloadUrlThumb, size, img);
	return img;
}

export function awsThumbFormat(img: string, w?: any, h?: any) {
	if (!img) return img;

	if (!img.startsWith('http')) {
		if (w && h && !img.includes('graph.facebook.com'))
			return format('{0}/{1}x{2}/{3}', env.awsUpload.downloadUrl, w, h, img);
		else return format('{0}/{1}', env.awsUpload.downloadUrl, img);
	} else {
		if (w && h && !img.includes('graph.facebook.com')) {
			img = img.replace(/%2F/g, '/');
			let arr_split = img.split('/');
			arr_split[arr_split.length - 1] = `${w}x${h}/${arr_split[arr_split.length - 1]}`;

			return arr_split.join('/');
		} else {
			return img;
		}
	}
}

/**
 *
 * @param obj object need to add thumb
 * @param path path to image field in object
 * @description assign thumb url for image property of object
 */
export function assignThumbUrl(obj: any | Array<any>, path: string) {
	_.flatten([obj]).forEach((item) => {
		const img = _.get(item, path) as string;
		const url = awsThumbFormat(img);
		_.set(item, path, url);

		[50].forEach((size) => {
			const url = awsThumbFormat(img, size, size);
			_.set(item, `${path}_${size}`, url);
		});
	});
	return obj;
}

export function getNumberFromString(str: any) {
	if (!str) return '';
	const patt = /[0-9]/g;
	const result = str.toString().match(patt);
	const resultNumber = result.toString().replace(/[^0-9\.]+/g, '');
	return Number(resultNumber);
}

function equijoin(primary, foreign, primaryKey, foreignKey, select) {
	let m = primary.length;
	let n = foreign.length;
	let index = [];
	let c = [];

	for (let i = 0; i < n; i++) {
		// loop through n items
		let row = foreign[i];
		if (foreign[i].toObject) row = foreign[i].toObject();
		if (row[foreignKey] instanceof Schema.Types.ObjectId) {
			index[row[foreignKey].valueOf()] = row;
		} else {
			index[row[foreignKey]] = row;
		} // create an index for primary table
	}

	for (let j = 0; j < m; j++) {
		// loop through m items
		let y = primary[j];
		if (primary[j].toObject) y = primary[j].toObject();
		var x;
		if (y[primaryKey] instanceof Schema.Types.ObjectId) {
			x = index[y[primaryKey].valueOf()];
		} else {
			x = index[y[primaryKey]];
		}

		if (x) {
			c.push(select(y, x));
		} else {
			// select only the columns you need
			c.push(y);
		}
	}

	return c;
}

export function mergeCollections(collections) {
	return _.reduce(collections, function (result, collection) {
		// var newResult = result.toObject ? result.toObject() : result
		// var cleanObj = collection.toObject ? collection.toObject() : collection
		return equijoin(result, collection || [], '_id', '_id', function (a, b) {
			return _.assign({}, a || {}, b || {});
		});
	});
}

export function handleShufferItemInArray(arrs: Array<any>) {
	let length = arrs.length;
	let temp, index;
	while (length > 0) {
		index = Math.floor(Math.random() * length);
		length--;
		temp = arrs[length];
		arrs[length] = arrs[index];
		arrs[index] = temp;
	}
	return arrs;
}

export function getRandomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export function getSource(urlProduct: string) {
	if (/yahoo.co.jp/.test(urlProduct)) {
		return SourceProduct.YAHOO;
	}
	if (/rakuten.co.jp/.test(urlProduct)) {
		return SourceProduct.RAKUTEN;
	}
	if (/amazon.co.jp/.test(urlProduct)) {
		return SourceProduct.AMAZON;
	}
	return;
}

export function getAsinCodeFromUrl(url: String) {
	return last(url.split('?')[0].split('/'));
}
