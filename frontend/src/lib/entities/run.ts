import type { Task } from '$lib/entities/task';

export type Run = {
	id: string;
	status: 'pending' | 'running' | 'completed' | 'failed';
	progress: number;
	message: string;
	tasks: Task[];
	brainState: 'thinking' | 'executingAction';
	resultReason: string;
};
