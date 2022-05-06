import { ErrorCode, SourceProduct } from '$enum/common';
import env from '$config/env';
import axios from 'axios';
import SubProduct from '$schema/SubProduct';

export async function createAffiliateUrl(params: any) {
	if (params.source === SourceProduct.RAKUTEN) {
		if (!params?.itemCode) return;
		const responseRakuten = await axios.get(
			`${env.rakuten.rakutenDomain}?format=json&itemCode=${params.itemCode}&affiliateId=${env.rakuten.affiliateId}&applicationId=${env.rakuten.applicationId}`
		);
		const affiliateUrl = responseRakuten?.data?.Items[0]?.Item?.affiliateUrl;
		await SubProduct.updateOne(
			{ _id: params._id, source: params.source, itemCode: params.itemCode, active: true },
			{ affiliateUrl }
		);
		return;
	}

	if (params.source === SourceProduct.YAHOO) {
		const data = params.urlProduct.split('?');
		const encodeUrl = encodeURIComponent(data[0]);
		const sid = 3579193;
		const pid = 887079474;
		const affiliateUrl = `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodeUrl}`;
		await SubProduct.updateOne(
			{ _id: params._id, source: params.source, active: true },
			{ affiliateUrl }
		);
		return;
	}

	if (params.source === SourceProduct.AMAZON) {
		const affiliateUrl = `${params.urlProduct}?tag=a0997-22&linkCode=osi&th=1&psc=1`;
		await SubProduct.updateOne(
			{ _id: params._id, source: params.source, active: true },
			{ affiliateUrl }
		);
		return;
	}
	return;
}
