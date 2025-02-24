export type JobStatus = 'running' | 'pending' | 'running' | 'completed' | 'failed';
export type Job = {
    id: string;
    wsEndpoint: string;
    startUrl: string;
    scenario: string;
    sessionId: string;
    liveUrl: string;
    status: JobStatus;
};
