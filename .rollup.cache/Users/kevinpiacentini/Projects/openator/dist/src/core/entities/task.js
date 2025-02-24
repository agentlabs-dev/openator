import * as crypto from 'crypto';
export class TaskAction {
    constructor(data) {
        this.data = data;
        this.id = crypto.randomUUID();
        this._status = 'pending';
        this.data = data;
        this.result = '';
    }
    get status() {
        return this._status;
    }
    start() {
        this._status = 'running';
    }
    complete(result) {
        this._status = 'completed';
        this.result = result ?? 'ok';
    }
    cancel(reason) {
        this._status = 'cancelled';
        this._reason = reason;
    }
    fail(reason) {
        this._status = 'failed';
        this._reason = reason;
        this.result = `Action failed with reason: ${reason}`;
    }
    asObject() {
        return {
            id: this.id,
            status: this.status,
            reason: this._reason,
            name: this.data.name,
            params: this.data.params,
            description: this.data.description,
        };
    }
    objectForLLM() {
        return {
            description: this.data.description,
            status: this.status,
            result: this.result,
            reason: this._reason,
        };
    }
}
export class Task {
    constructor(id, goal, actions, _status, _reason = undefined) {
        this.id = id;
        this.goal = goal;
        this.actions = actions;
        this._status = _status;
        this._reason = _reason;
    }
    static InitPending(goal, actions) {
        const taskActions = actions.map((action) => new TaskAction(action));
        return new Task(crypto.randomUUID(), goal, taskActions ?? [], 'pending');
    }
    get status() {
        return this._status;
    }
    get reason() {
        return this._reason;
    }
    get pendingActions() {
        return this.actions.filter((action) => action.status === 'pending');
    }
    get nextPendingAction() {
        return this.pendingActions[0] ?? null;
    }
    completeAction(id) {
        const action = this.actions.find((action) => action.id === id);
        if (!action) {
            throw new Error('Action not found');
        }
        action.complete();
        if (!this.pendingActions.length) {
            action.complete();
        }
        if (!this.pendingActions.length) {
            this.complete();
        }
    }
    cancelAction(id, reason) {
        const action = this.actions.find((action) => action.id === id);
        if (!action) {
            throw new Error('Action not found');
        }
        action.cancel(reason);
        this.cancel(reason);
    }
    start() {
        this._status = 'running';
    }
    complete() {
        this._status = 'completed';
    }
    cancel(reason) {
        this._status = 'cancelled';
        this._reason = reason;
    }
    fail(reason) {
        this._status = 'failed';
        this._reason = reason;
    }
    objectForLLM() {
        return {
            goal: this.goal,
            actionsTaken: this.actions.map((action) => action.objectForLLM()),
        };
    }
    serialize() {
        return JSON.stringify({
            id: this.id,
            goal: this.goal,
            actions: this.actions.map((action) => action.asObject()),
            status: this.status,
            reason: this.reason,
        });
    }
    asObject() {
        return {
            id: this.id,
            goal: this.goal,
            actions: this.actions.map((action) => action.asObject()),
            status: this.status,
            reason: this.reason,
        };
    }
}
//# sourceMappingURL=task.js.map