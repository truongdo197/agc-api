export const assignCodeSchema: AjvSchema = {
	type: 'object',
	required: ['fileName'],
	additionalProperties: false,
	properties: {
		fileName: {
			type: 'string',
			maxLength: 250,
		},
	},
};
