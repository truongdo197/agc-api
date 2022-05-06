import { SourceProduct } from '$enum/common';

export const createAffiliateUrlSchema: AjvSchema = {
	type: 'object',
	required: ['source'],
	additionalProperties: false,
	properties: {
		source: {
			type: 'string',
			enum: Object.values(SourceProduct),
		},
		itemCode: { type: 'string' },
		urlProduct: { type: 'string' },
		_id: { type: 'string' },
	},
};
