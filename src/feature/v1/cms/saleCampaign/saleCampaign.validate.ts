export const listSaleCampaignSchema: AjvSchema = {
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

export const createSaleCampaignSchema: AjvSchema = {
	type: 'object',
	required: ['title', 'url', 'startDate', 'endDate', 'store', 'discount', 'source'],
	additionalProperties: false,
	properties: {
		title: {
			type: 'string',
		},
		image: {
			type: 'string',
		},
		url: {
			type: 'string',
		},
		startDate: { format: 'date-time' },
		endDate: { format: 'date-time' },
		store: {
			type: 'string',
		},
		discount: {
			type: 'string',
		},
		source: {
			type: 'string',
		},
	},
};

export const updateSaleCampaignSchema: AjvSchema = {
	type: 'object',
	required: [],
	additionalProperties: false,
	properties: {
		title: {
			type: 'string',
		},
		image: {
			type: 'string',
		},
		url: {
			type: 'string',
		},
		startDate: { format: 'date-time' },
		endDate: { format: 'date-time' },
		store: {
			type: 'string',
		},
		discount: {
			type: 'string',
		},
		source: {
			type: 'string',
		},
	},
};
