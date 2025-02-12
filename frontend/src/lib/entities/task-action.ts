export type TaskAction = {
	id: string;
	description: string;
	status: 'pending' | 'running' | 'completed' | 'failed';
	name: 'clickElement' | 'fillInput';
};
