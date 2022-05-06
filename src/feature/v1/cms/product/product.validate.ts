import { CodeType, SourceProduct, SubProductStatus } from '../../../../types/enum/common';
export const listProductSchema: AjvSchema = {
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
		keyword: {
			type: 'string',
		},
		sort: {
			type: 'string',
		},
	},
};

export const addProductFactory: AjvSchema = {
	type: 'object',
	required: ['title'],
	additionalProperties: false,
	properties: {
		title: {
			type: 'string',
			minLength: 1,
		},
		asinCode: {
			type: 'string',
			minLength: 1,
		},
		janCode: {
			type: 'string',
			minLength: 1,
		},
	},
};

export const updateSubProductSchema: AjvSchema = {
	type: 'object',
	required: [],
	additionalProperties: false,
	properties: {
		title: { type: 'string' },
		longDescriptions: { type: 'array', items: { type: 'string' } },
		shortDescriptions: { type: 'array', items: { type: 'string' } },
		sku: { type: 'string' },
		store: { type: 'string' },
		code: {
			type: 'object',
			properties: {
				codeType: { type: 'string' },
				value: { type: 'string' },
			},
		},
		urlProduct: { type: 'string' },
		source: {
			type: 'string',
			items: {
				enum: Object.values(SourceProduct),
			},
		},
		discount: { type: 'number' },
		images: { type: 'array', items: { type: 'string' } },
		price: { type: 'number' },
		specification: {
			type: 'object',
		},
		status: { type: 'number', enum: Object.values(SubProductStatus) },
		hasFee: { type: 'boolean' },
	},
};

export const updateProductSchema: AjvSchema = {
	type: 'object',
	required: ['product', 'subProducts'],
	additionalProperties: false,
	properties: {
		product: {
			type: 'object',
			required: [],
			additionalProperties: false,
			properties: {
				_id: { type: 'string' },
				title: { type: 'string' },
				longDescriptions: { type: 'array', items: { type: 'string' } },
				shortDescriptions: { type: 'array', items: { type: 'string' } },
				images: { type: 'array' },
				codes: {
					type: ['array'],
					items: {
						properties: {
							value: { type: 'string' },
							codeType: { type: 'string' },
						},
					},
				},
				specification: {
					type: 'object',
				},
				thumbnail: { type: 'string' },
				price: { type: 'number' },
				tag: { type: 'string' },
				similarProducts: {
					type: 'array',
					items: {
						type: 'string',
					},
					uniqueItems: true,
					minLength: 0,
				},
			},
		},
		newSubProducts: {
			type: 'array',
			items: {
				additionalProperties: false,
				properties: {
					title: { type: 'string' },
					longDescriptions: { type: 'array', items: { type: 'string' } },
					shortDescriptions: { type: 'array', items: { type: 'string' } },
					sku: { type: 'string' },
					store: { type: 'string' },
					code: {
						type: 'object',
						properties: {
							codeType: { type: 'string' },
							value: { type: 'string' },
						},
					},
					urlProduct: { type: 'string' },
					source: {
						type: 'string',
						items: {
							enum: Object.values(SourceProduct),
						},
					},
					discount: { type: 'number' },
					images: { type: 'array', items: { type: 'string' } },
					price: { type: 'number' },
					specification: {
						type: 'object',
					},
					status: { type: 'number', enum: Object.values(SubProductStatus) },
					hasFee: { type: 'boolean' },
				},
			},
		},
		subProducts: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
	},
};

export const addProductSchema: AjvSchema = {
	type: 'object',
	required: ['product'],
	additionalProperties: false,
	properties: {
		product: {
			type: 'object',
			required: ['title', 'longDescriptions', 'shortDescriptions', 'images', 'tag', 'thumbnail'],
			additionalProperties: false,
			properties: {
				title: { type: 'string' },
				longDescriptions: { type: 'array', items: { type: 'string' } },
				shortDescriptions: { type: 'array', items: { type: 'string' } },
				images: { type: 'array' },
				codes: {
					type: ['array'],
					items: {
						properties: {
							value: { type: 'string' },
							codeType: { type: 'string' },
						},
					},
				},
				specification: {
					type: 'object',
				},
				thumbnail: { type: 'string' },
				tag: { type: 'string' },
				similarProducts: {
					type: 'array',
					items: {
						type: 'string',
					},
					uniqueItems: true,
					minLength: 0,
				},
			},
		},
		newSubProducts: {
			type: 'array',
			items: {
				required: ['title', 'images', 'sku', 'store', 'urlProduct', 'price', 'discount'],
				additionalProperties: false,
				properties: {
					title: { type: 'string' },
					longDescriptions: { type: 'array', items: { type: 'string' } },
					shortDescriptions: { type: 'array', items: { type: 'string' } },
					sku: { type: 'string' },
					store: { type: 'string' },
					code: {
						type: 'object',
						properties: {
							codeType: { type: 'string' },
							value: { type: 'string' },
						},
					},
					urlProduct: { type: 'string' },
					source: {
						type: 'string',
						items: {
							enum: Object.values(SourceProduct),
						},
					},
					discount: { type: 'number' },
					images: { type: 'array', items: { type: 'string' } },
					price: { type: 'number' },
					specification: {
						type: 'object',
					},
					status: { type: 'number', enum: Object.values(SubProductStatus) },
					hasFee: { type: 'boolean' },
				},
			},
		},
		subProducts: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
	},
};
