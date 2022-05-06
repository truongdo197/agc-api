export const updateHotProductListValidate: AjvSchema = {
	type: 'object',
	required: ['productIds'],
	additionalProperties: false,

	properties: {
		productIds: {
			type: 'array',
			maxLength: 30,
		},
	},
};

export const updateAFLinkValidate: AjvSchema = {
	type: 'object',
	required: ['yahoo', 'rakuten', 'amazon'],
	additionalProperties: false,
	properties: {
		yahoo: {
			type: 'string',
		},
		rakuten: {
			type: 'string',
		},
		amazon: {
			type: 'string',
		},
	},
};

export const updateAdvertisingProductListValidate: AjvSchema = {
	type: 'object',
	required: ['productIds'],
	additionalProperties: false,

	properties: {
		productIds: {
			type: 'array',
			maxLength: 30,
		},
	},
};
