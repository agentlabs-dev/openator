import type { Job } from '$lib/entities/job';
import { writable, get } from 'svelte/store';

export interface ChatStore {
	job: Job | null;
}

export const chatStore = writable<ChatStore>({
	job: null
});

export const setChatJob = (job: Job) => {
	chatStore.update((state) => ({
		...state,
		job
	}));
};

export const getChatJob = () => {
	return get(chatStore).job;
};
