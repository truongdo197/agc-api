export const tagSchema: AjvSchema = {
	type: 'object',
	required: [],
	additionalProperties: false,
	properties: {
		name: {
			type: 'string',
		},
		image: {
			type: 'string',
		},
		category: {
			type: 'string',
		},
		description: {
			type: 'string',
		},
		shortDescription: {
			type: 'string',
		},
	},
};
