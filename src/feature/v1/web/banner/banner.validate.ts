import { BannerType } from '$types/enum/common';

export const listBannerSchema: AjvSchema = {
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
		typeBanner: {
			enum: [BannerType.STANDARD, BannerType.ADVERTISING],
		},
		position: {
			type: 'integer',
		},
	},
};
