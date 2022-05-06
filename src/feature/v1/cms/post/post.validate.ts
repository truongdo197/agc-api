import { PostType } from '../../../../types/enum/common';
export const createPostSchema: AjvSchema = {
	type: 'object',
	required: ['image', 'title', 'postType', 'tag', 'category'],
	additionalProperties: false,
	properties: {
		title: {
			type: 'string',
			maxLength: 300,
		},
		content: {
			type: 'string',
		},
		image: {
			type: 'string',
			maxLength: 300,
		},
		postType: {
			type: 'number',
			enum: Object.values(PostType),
		},
		createdBy: {
			type: 'string',
		},
		tag: {
			type: 'string',
		},
		category: {
			type: 'string',
		},
		url: { type: 'string' },
	},
};

export const updatePostSchema: AjvSchema = {
	type: 'object',
	required: [],
	additionalProperties: false,
	properties: {
		title: {
			type: 'string',
			maxLength: 300,
		},
		content: {
			type: 'string',
		},
		image: {
			type: 'string',
			maxLength: 300,
		},
		postType: {
			type: 'number',
			enum: Object.values(PostType),
		},
		tag: {
			type: 'string',
		},
		category: {
			type: 'string',
		},
		url: { type: 'string' },
	},
};
