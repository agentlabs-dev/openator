import type { Job } from '$lib/entities/job';
import { writable, get } from 'svelte/store';
import { openRealtimeConnection } from './realtime';

export interface JobsStore {
	list: Job[];
	selectedJobId: string | null;
}

export const jobsStore = writable<JobsStore>({
	list: [],
	selectedJobId: null
});

export const setJobs = (jobs: Job[]) => {
	jobsStore.update((state) => ({
		...state,
		list: jobs
	}));
};

export const setSelectedJobId = (jobId: string) => {
	jobsStore.update((state) => ({
		...state,
		selectedJobId: jobId
	}));
};

export const getJobById = (jobId: string) => {
	return get(jobsStore).list.find((job) => job.id === jobId);
};

export const getSelectedJob = () => {
	const jobId = get(jobsStore).selectedJobId;

	if (!jobId) {
		return null;
	}

	return getJobById(jobId);
};
