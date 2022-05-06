import _ from 'lodash';
import io from '$config/socket';
import { paramSocket } from '$utils/response';
export async function handleEmit() {
	const nameEmit = 'success-migrate';
	io.getIO().emit(
		nameEmit,
		paramSocket(nameEmit, 'migrate data from mongo to elasticsearch success')
	);
	return;
}
