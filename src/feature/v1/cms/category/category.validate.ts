export const categorySchema: AjvSchema = {
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
		description: {
			type: 'string',
		},
		shortDescription: {
			type: 'string',
		},
	},
};
