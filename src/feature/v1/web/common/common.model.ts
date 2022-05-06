import Common from '$schema/Common';
import { CommonType } from '$enum/common';
export async function getSlogan() {
	const slogan = await Common.findOne({ type: CommonType.SLOGAN });
	if (!slogan) {
		const newSlogan = new Common({
			type: CommonType.SLOGAN,
			content:
				'園芸資材の最安値なら「AGRI PICK tools」「還元ポイント」や「送料」も込みで比較できる価格比較サイトです。',
		});
		return newSlogan.save();
	}
	return slogan;
}

export async function getAFLink() {
	const afLink = await Common.findOne({ type: CommonType.AF_Link });
	if (!afLink) {
		const newAFLink = new Common({
			type: CommonType.AF_Link,
			value: { Rakuten: '', Amazon: '', Yahoo: '' },
		});
		return newAFLink.save();
	}
	return afLink;
}

export async function getGoogleTagScript() {
	const script = await Common.findOne({ type: CommonType.GOOGLE_TAG_SCRIPT });
	if (!script) {
		const newScript = new Common({
			type: CommonType.GOOGLE_TAG_SCRIPT,
			content: '<script></script>',
		});
		return await newScript.save();
	}
	return script;
}
