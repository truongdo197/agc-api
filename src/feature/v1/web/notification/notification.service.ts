import { ParamsReturnPaging } from '$types/interface/Pagination.definition';
import { getObjectId, returnPaging } from '$utils/utils';
import Notification from '$schema/Notification';
import { map } from 'lodash';

interface IListNotification extends ParamsReturnPaging {
	memberId: string;
}
export async function getListNotification(memberId: string, params: IListNotification) {
	const conditions = {
		member: getObjectId(memberId),
	};
	const data = await Notification.find(conditions)
		.limit(params.pageSize)
		.skip(params.start)
		.sort(params.sort);
	const totalItems = await Notification.countDocuments(conditions);
	return returnPaging(data, totalItems, params);
}

export async function hasUnreadNoti(memberId: string) {
	const countUnreadNoti = await Notification.countDocuments({
		isRead: false,
		member: getObjectId(memberId),
	});
	return !!countUnreadNoti;
}

export async function markNotiAsRead(notiId: string) {
	return await Notification.updateOne({ _id: notiId }, { isRead: true });
}
