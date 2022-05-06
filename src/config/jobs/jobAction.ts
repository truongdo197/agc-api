import log from '../log';
import { Job, JobsOptions, Queue } from 'bullmq';
import { JobOptions } from 'bull';
import { assign } from 'lodash';
import { JobName } from '../../types/enum/common';

//xử lý queue
const logger = log('Worker');
export async function addJobs(
	queue: Queue,
	jobName: string,
	payload: Object,
	option?: JobsOptions
) {
	await queue.add(jobName, payload, { attempts: 3, timeout: 5000, ...option });
}
export async function getActiveJobs(queue) {
	return await queue.getJobs('active');
}
export async function getNumActiveJobs(queue) {
	return await queue.getActiveCount();
}
export async function clearRedis(queue) {
	const clearTimeOver = 24 * 60 * 60 * 1000;
	return await queue.clean(clearTimeOver, 10000, 'completed');
}

//xử lý worker
export function handleJobs(worker) {
	worker.on('completed', async (job: Job) => {
		await job.remove();
	});
	worker.on('failed', (job: Job, error: Error) => {
		logger.error(`${job.name} Failed. Reason: ${job.failedReason}`);
		logger.error(`${job.name} Faild: JOB ${job} STACK ${error.stack}`);
	});
}
