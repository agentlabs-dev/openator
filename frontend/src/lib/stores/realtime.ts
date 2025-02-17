import type { Socket } from 'socket.io-client';
import io from 'socket.io-client';

import { get, writable } from 'svelte/store';

export interface RealtimeStore {
	connection: Socket | null;
	startConversationMessage: string | null;
}

export const realtimeStore = writable<RealtimeStore>({
	connection: null,
	startConversationMessage: null
});

export const getRealtimeConnection = async () => {
	const existingConnection = get(realtimeStore).connection;

	if (existingConnection) {
		return existingConnection;
	}

	const connection = io('http://localhost:3000', {
		extraHeaders: {}
	});

	connection.connect();

	await new Promise<void>((resolve) => {
		connection.on('connect', () => {
			resolve();
		});
	});

	realtimeStore.update((store) => {
		store.connection = connection;

		return store;
	});

	return connection;
};
