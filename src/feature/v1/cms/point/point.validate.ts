import { SourceProduct, PointType } from '$enum/common';

export const listPointSchema: AjvSchema = {
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
	},
};

export const addPointSchema: AjvSchema = {
	type: 'object',
	required: ['title', 'source', 'pointUrl', 'type'],
	additionalProperties: false,
	properties: {
		title: {
			type: 'string',
		},
		content: {
			type: 'string',
		},
		options: { type: 'array' },
		source: {
			type: 'string',
			enum: Object.values(SourceProduct),
		},
		rate: {
			type: 'number',
			minimum: 0,
			maximum: 100,
		},
		pointUrl: { type: 'string' },
		type: { type: 'number' },
	},
};

export const updatePointSchema: AjvSchema = {
	type: 'object',
	required: ['_id', 'title', 'source', 'pointUrl', 'type'],
	additionalProperties: false,
	properties: {
		_id: {
			type: 'string',
		},
		title: {
			type: 'string',
		},
		content: {
			type: 'string',
		},
		type: { type: 'number' },
		source: {
			type: 'string',
			enum: Object.values(SourceProduct),
		},
		rate: {
			type: 'number',
			minimum: 0,
			maximum: 100,
		},
		pointUrl: { type: 'string' },
		options: { type: 'array' },
	},
};
