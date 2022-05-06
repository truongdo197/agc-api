export const getWatchingListsSchema: AjvSchema = {
	type: 'object',
	required: ['memberId'],
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
		memberId: { type: 'string' },
	},
};

export const getListProductByWatchingListSchema: AjvSchema = {
	type: 'object',
	required: ['watchingList'],
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
		watchingList: { type: 'string' },
	},
};

export const addAndUnmarkProductToFavoriteSchema: AjvSchema = {
	type: 'object',
	required: ['productId'],
	additionalProperties: false,
	properties: {
		productId: { type: 'string' },
		watchingList: { type: 'string' },
	},
};

export const addProductToWatchingListSchema: AjvSchema = {
	type: 'object',
	required: ['watchingList', 'products'],
	additionalProperties: false,
	properties: {
		watchingList: { type: 'string' },
		products: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
	},
};
