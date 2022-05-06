export const listProductSchema: AjvSchema = {
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
		keyword: {
			type: 'string',
		},
		sort: {
			type: 'string',
		},
		category: {
			type: 'string',
		},
		memberId: {
			type: 'string',
		},
		filter: {
			type: 'object',
		},
		tags: {
			type: 'array',
		},
	},
};

export const productHistorySchema: AjvSchema = {
	type: 'object',
	required: ['product'],
	additionalProperties: false,
	properties: {
		member: { type: 'string' },
		product: { type: 'string' },
	},
};
