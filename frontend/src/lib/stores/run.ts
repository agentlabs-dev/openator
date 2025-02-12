import io from 'socket.io-client';
import { writable } from 'svelte/store';
import type { Run } from '$lib/entities/run';

export const currentRunStore = writable<Run | null>(null);

const socket = io('http://localhost:3000');

socket.on('connect', () => {
	console.log('Connected to backend');
});

socket.on('runData', (data: Run) => {
	console.log('runData', data);
	currentRunStore.set(data);
});

export const subscribeToRunUpdates = () => {
	socket.emit('subscribe');
};
