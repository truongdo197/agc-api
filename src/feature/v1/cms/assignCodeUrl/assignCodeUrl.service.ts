import { assignThumbUrl } from '$utils/utils';
import axios from 'axios';
import { addJobs } from '$config/jobs/jobAction';
import { handleCodesFileQueue } from '$config/jobs/Queue';
import { JobName } from '$types/enum/common';
import _ from 'lodash';

interface IAssignCodeParams {
	fileName: string;
}
export async function handleCodesFile(params: IAssignCodeParams) {
	assignThumbUrl(params, 'fileName');
	const { fileName } = params;
	const data = await axios.get(fileName);

	let dataArr = data.data.split('\r\n');
	dataArr = dataArr.filter((item: string) => item.indexOf(',,,,,FALSE,,,,,,,,,,,,') === -1);

	for (const item of dataArr) {
		await addJobs(handleCodesFileQueue, JobName.HANDLE_CODES_FILE, item);
	}

	return;
}
