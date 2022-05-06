
export const listMemberSchema: AjvSchema = {
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
		keyword: { type: 'string' },
	},
};

export const addMemberSchema: AjvSchema = {
	type: 'object',
	required: ['fullName', 'email', 'password'],
	additionalProperties: false,
	properties: {
		fullName: {
			type: 'string',
		},
		email: {
			type: 'string',
		},
		password: { type: 'string' },
	},
};

export const updateMemberSchema: AjvSchema = {
	type: 'object',
	required: [],
	additionalProperties: false,
	properties: {
		fullName: {
			type: 'string',
		},
		email: {
			type: 'string',
		},
	},
};
