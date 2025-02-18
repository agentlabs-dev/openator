import type { Task } from '$lib/entities/task';

export type Job = {
	id: string;
	liveUrl: string;
	sessionId: string;
	status: 'pending' | 'running' | 'completed' | 'failed';
	scenario: string;
	tasks: Task[];
	brainState: 'thinking' | 'executingAction';
	resultReason: string;
	result: string;
};
