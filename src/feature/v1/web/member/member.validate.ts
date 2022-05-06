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
		keyword: {
			type: 'string',
		},
	},
};

export const addMemberSchema: AjvSchema = {
	type: 'object',
	required: ['password', 'email', 'fullName'],
	additionalProperties: false,
	properties: {
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
	},
};

export const signInSchema: AjvSchema = {
	type: 'object',
	required: ['password', 'email'],
	additionalProperties: false,
	properties: {
		password: {
			type: 'string',
			minLength: 6,
			maxLength: 250,
		},
		email: {
			type: 'string',
			format: 'email',
		},
	},
};

export const sendMailResetPasswordSchema: AjvSchema = {
	type: 'object',
	required: ['email'],
	additionalProperties: false,
	properties: {
		email: {
			type: 'string',
			format: 'email',
		},
	},
};

export const resetPasswordSchema: AjvSchema = {
	type: 'object',
	required: ['newPassword', 'token'],
	additionalProperties: false,
	properties: {
		newPassword: {
			type: 'string',
		},
		token: {
			type: 'string',
		},
	},
};

export const changePasswordSchema: AjvSchema = {
	type: 'object',
	required: ['newPassword', 'oldPassword'],
	additionalProperties: false,
	properties: {
		newPassword: {
			type: 'string',
			minLength: 6,
			maxLength: 250,
		},
		oldPassword: {
			type: 'string',
			minLength: 6,
			maxLength: 250,
		},
	},
};

export const updateProfileMemberSchema: AjvSchema = {
	type: 'object',
	additionalProperties: false,
	properties: {
		fullName: {
			type: 'string',
			minLength: 1,
			maxLength: 250,
		},
		avatar: {
			type: 'string',
		},
	},
};
