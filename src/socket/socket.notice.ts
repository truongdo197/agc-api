import io from '$config/socket';
import log from '$config/log';
import { paramSocket } from '$utils/response';
export async function handleNoticeMigrateDataSuccess() {
	log('***** socket ***** notice migrate success');
	const nameEmit = 'success-migrate';
	io.getIO().emit(
		nameEmit,
		paramSocket(nameEmit, 'migrate data from mongo to elasticsearch success')
	);
}
