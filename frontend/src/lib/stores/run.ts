import io from 'socket.io-client';
import { writable } from 'svelte/store';
import type { Run } from '$lib/entities/run';

export const currentRunStore = writable<Run | null>(null);

const socket = io('http://localhost:3000');

export const subscribeToRunUpdates = (jobId: string) => {
	socket.on('connect', () => {
		console.log('Connected to backend');
	});

	socket.on(`run:update:${jobId}`, (data: Run) => {
		console.log('runData', data);
		currentRunStore.set(data);
	});

	socket.emit('subscribe', jobId);
};
