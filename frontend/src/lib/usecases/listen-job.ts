import type { Job } from '$lib/entities/job';
import { setChatJob } from '$lib/stores/chat';
import { getRealtimeConnection } from '$lib/stores/realtime';

export const listenJob = async (jobId: string) => {
	console.log('LISTENING', jobId);
	const connection = await getRealtimeConnection();

	console.log('SUBSCRIPTION', connection);

	connection.on(`job:update:${jobId}`, (data: Job) => {
		console.log('job:update', data);
		setChatJob(data);
	});

	console.log('job:subscribe', jobId);
	connection.emit('job:subscribe', jobId);
};

export const readAndListenJob = async (
	jobId: string
): Promise<{
	job: Job | null;
}> => {
	await new Promise((resolve) => setTimeout(resolve, 2000));

	// const job = await fetchJob(jobId);
	// setChatJob(job);

	listenJob(jobId);

	return {
		job: null
	};
};
