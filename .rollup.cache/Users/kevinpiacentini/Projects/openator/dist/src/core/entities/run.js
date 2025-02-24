export class Run {
    constructor(scenario, jobId) {
        this.scenario = scenario;
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
    static InitRunning(scenario, jobId) {
        return new Run(scenario, jobId);
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
    addTask(task) {
        this._tasks.push(task);
    }
    updateTask(task) {
        this._tasks = this._tasks.map((t) => (t.id === task.id ? task : t));
    }
    setSuccess(answer) {
        this._status = 'completed';
        this._result = answer;
    }
    setFailure(reason) {
        this._status = 'failed';
        this._resultReason = reason;
    }
}
//# sourceMappingURL=run.js.map