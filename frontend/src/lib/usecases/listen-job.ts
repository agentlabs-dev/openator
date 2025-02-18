import type { Job } from '$lib/entities/job';
import { setChatJob } from '$lib/stores/chat';
import { getRealtimeConnection } from '$lib/stores/realtime';

export const listenJob = async (jobId: string) => {
	const connection = await getRealtimeConnection();

	connection.on(`job:update:${jobId}`, (data: Job) => {
		console.log('job:update', data);
		setChatJob(data);
	});
	connection.emit('job:subscribe', jobId);
};

export const readAndListenJob = async (
	jobId: string
): Promise<{
	job: Job | null;
}> => {
	listenJob(jobId);

	await new Promise((resolve) => setTimeout(resolve, 2000));

	// const job = await fetchJob(jobId);
	// setChatJob(job);

	return {
		job: null
	};
};
