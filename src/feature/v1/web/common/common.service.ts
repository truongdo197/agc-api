import * as model from './common.model';

export async function getSlogan() {
	return await model.getSlogan();
}

export async function getAFLink() {
	return await model.getAFLink();
}

export async function getGoogleTagScript() {
	return await model.getGoogleTagScript();
}
