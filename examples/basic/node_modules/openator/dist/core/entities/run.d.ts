import { Task } from './task';
export type RunStatus = 'running' | 'pending' | 'running' | 'completed' | 'failed';
export type RunBrainState = 'thinking' | 'executingAction';
export declare class Run {
    readonly scenario: string;
    readonly id: string;
    private _status;
    private _tasks;
    private _retries;
    private _brainState;
    private _resultReason;
    private _result;
    constructor(scenario: string, jobId?: string);
    get status(): string;
    get tasks(): Task[];
    get brainState(): RunBrainState;
    get resultReason(): string;
    get result(): string;
    static InitRunning(scenario: string, jobId?: string): Run;
    think(): void;
    executeAction(): void;
    retry(): void;
    run(): void;
    addTask(task: Task): void;
    updateTask(task: Task): void;
    setSuccess(answer: string): void;
    setFailure(reason: string): void;
}
