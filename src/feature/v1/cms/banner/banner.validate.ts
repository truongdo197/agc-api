import { BannerPosition, BannerType } from '$types/enum/common';

export const listBannerSchema: AjvSchema = {
	type: 'object',
	required: [],
	additionalProperties: false,
	properties: {
		pageIndex: {
			type: 'integer',
			minimum: 1,
		},
		pageSize: {
			type: 'integer',
			minimum: 1,
		},
		start: {
			type: 'integer',
		},
		sort: {
			type: 'string',
		},
		typeBanner: {
			enum: Object.values(BannerType),
		},
	},
};

export const addBannerSchema: AjvSchema = {
	type: 'object',
	required: ['typeBanner'],
	additionalProperties: false,
	properties: {
		typeBanner: {
			type: 'number',
			enum: Object.values(BannerType),
		},
		price: {
			type: 'number',
		},
		url: {
			type: 'string',
			format: 'uri',
		},
		content: {
			type: 'string',
			minLength: 1,
		},
		image: {
			type: 'string',
			minLength: 1,
		},
		position: {
			type: 'number',
			enum: Object.values(BannerPosition),
		},
	},
};

export const updateBannerSchema: AjvSchema = {
	type: 'object',
	required: [],
	additionalProperties: false,
	properties: {
		_id: {
			type: 'string',
		},
		price: {
			type: 'number',
		},
		typeBanner: {
			enum: Object.values(BannerType),
		},
		url: {
			type: 'string',
			format: 'uri',
		},
		content: {
			type: 'string',
			minLength: 1,
		},
		image: {
			type: 'string',
			minLength: 1,
		},
		position: {
			type: 'number',
			enum: Object.values(BannerPosition),
		},
	},
};

export const deleteBannerSchema: AjvSchema = {
	type: 'object',
	required: ['_id'],
	additionalProperties: false,
	properties: {
		_id: {
			type: 'string',
		},
	},
};
