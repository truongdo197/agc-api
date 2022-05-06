import { Role } from '../../../../types/enum/common';
export const listAccountSchema: AjvSchema = {
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
		keyword: {
			type: 'string',
		},
	},
};

export const addAccountSchema: AjvSchema = {
	type: 'object',
	required: ['username', 'password', 'email', 'fullName', 'mobile', 'roles'],
	additionalProperties: false,
	properties: {
		username: {
			type: 'string',
			maxLength: 250,
			minLength: 1,
		},
		password: {
			type: 'string',
			minLength: 6,
			maxLength: 250,
		},
		email: {
			type: 'string',
			format: 'email',
		},
		fullName: {
			type: 'string',
			minLength: 1,
			maxLength: 250,
		},
		mobile: {
			type: 'string',
			maxLength: 20,
			pattern: '^([0-9\\+\\s-]{8,13})$',
		},
		roles: {
			type: 'array',
			items: {
				type: 'string',
				enum: Object.values(Role),
			},
		},
	},
};

export const updateAccountSchema: AjvSchema = {
	type: 'object',
	required: ['id', 'username', 'email', 'fullName', 'mobile', 'roles'],
	additionalProperties: false,
	properties: {
		id: {
			type: 'string',
		},
		username: {
			type: 'string',
			maxLength: 250,
			minLength: 1,
		},
		email: {
			type: 'string',
			format: 'email',
		},
		fullName: {
			type: 'string',
			minLength: 1,
			maxLength: 250,
		},
		mobile: {
			type: 'string',
			maxLength: 20,
			pattern: '^([0-9\\+\\s-]{8,13})$',
		},
		roles: {
			type: 'array',
			items: {
				type: 'string',
				enum: Object.values(Role),
			},
		},
	},
};

export const deleteAccountSchema: AjvSchema = {
	type: 'object',
	required: ['_id'],
	additionalProperties: false,
	properties: {
		_id: {
			type: 'string',
		},
	},
};
