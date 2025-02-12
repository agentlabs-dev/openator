import type { TaskAction } from './task-action';

export type Task = {
	id: string;
	description: string;
	status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
	actions: TaskAction[];
};
