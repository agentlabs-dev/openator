import { Task } from './task';

export type RunStatus =
  | 'running'
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed';

export type RunBrainState = 'thinking' | 'executingAction';

export class Run {
  public readonly id: string;
  private _status: string;
  private _tasks: Task[];
  private _retries: number;
  private _brainState: RunBrainState;
  private _resultReason: string;
  private _result: string;

  constructor(jobId?: string) {
    this.id = jobId || crypto.randomUUID();
    this._status = 'running';
    this._tasks = [];
    this._brainState = 'thinking';
    this._resultReason = '';
    this._result = '';
  }

  get status() {
    return this._status;
  }

  get tasks() {
    return this._tasks;
  }

  get brainState() {
    return this._brainState;
  }

  get resultReason() {
    return this._resultReason;
  }

  get result() {
    return this._result;
  }

  static InitRunning(jobId?: string) {
    return new Run(jobId);
  }

  think() {
    this._brainState = 'thinking';
  }

  executeAction() {
    this._brainState = 'executingAction';
  }

  retry() {
    this._retries += 1;
  }

  run() {
    this._status = 'running';
  }

  addTask(task: Task) {
    this._tasks.push(task);
  }

  updateTask(task: Task) {
    this._tasks = this._tasks.map((t) => (t.id === task.id ? task : t));
  }

  setSuccess(answer: string) {
    this._status = 'completed';
    this._result = answer;
  }

  setFailure(reason: string) {
    this._status = 'failed';
    this._resultReason = reason;
  }
}
