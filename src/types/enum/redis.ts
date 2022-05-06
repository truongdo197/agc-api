export const KeyRedis = {
	environment: {
		cms: 'cms',
		web: 'web',
	},
	resource: {
		prefix: `agr_${process.env.NODE_ENV}`,
		mark: 'resource',
		name: function (environment = '') {
			return `${this.prefix}:${this.mark}:${environment}`;
		},
	},
};
