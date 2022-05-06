export const crawlerMetricsSchema: AjvSchema = {
	type: 'object',
	required: ['totalUrl', 'succeededUrl', 'failedUrl'],
	additionalProperties: false,
	properties: {
		totalUrl: {
			type: 'integer',
		},
		succeededUrl: {
			type: 'integer',
		},
		failedUrl: {
			type: 'integer',
		},
	},
};
