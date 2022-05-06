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
	required: ['watchingList', 'memberId'],
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
		memberId: { type: 'string' },
	},
};

export const createWatchingListSchema: AjvSchema = {
	type: 'object',
	required: ['name', 'member'],
	additionalProperties: false,
	properties: {
		name: { type: 'string', minLength: 1, maxLength: 100 },
		member: { type: 'string' },
	},
};

export const editWatchingListSchema: AjvSchema = {
	type: 'object',
	required: ['name'],
	additionalProperties: false,
	properties: {
		name: { type: 'string', minLength: 1, maxLength: 100 },
	},
};

export const addProductToWatchingListSchema: AjvSchema = {
	type: 'object',
	required: ['watchingList', 'products', 'memberId'],
	additionalProperties: false,
	properties: {
		watchingList: { type: 'string' },
		memberId: { type: 'string' },
		products: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
	},
};
