export const listKeywordSchema: AjvSchema = {
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
		keyword: { type: 'string' },
	},
};

export const addKeywordSchema: AjvSchema = {
	type: 'object',
	required: ['keyword'],
	additionalProperties: false,
	properties: {
		keyword: {
			type: 'string',
		},
	},
};
