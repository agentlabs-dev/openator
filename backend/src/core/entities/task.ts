import * as crypto from 'crypto';
import { ManagerAgentAction } from '@/core/agents/manager-agent/manager-agent.types';

export type TaskStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'running';

export type TaskActionStatus =
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'running';

export class TaskAction {
  public readonly id: string;
  private _reason: string | undefined;
  private _status: TaskActionStatus;

  /**
   * The result of the action when it is completed.
   */
  public result: string;

  constructor(public readonly data: ManagerAgentAction) {
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

  complete(result?: string) {
    this._status = 'completed';
    this.result = result ?? 'ok';
  }

  cancel(reason: string) {
    this._status = 'cancelled';
    this._reason = reason;
  }

  fail(reason: string) {
    this._status = 'failed';
    this._reason = reason;
    this.result = `Action failed with reason: ${reason}`;
  }

  public asObject() {
    return {
      id: this.id,
      status: this.status,
      reason: this._reason,
      name: this.data.name,
      params: this.data.params,
      description: this.data.description,
    };
  }

  public objectForLLM() {
    return {
      description: this.data.description,
      status: this.status,
      result: this.result,
      reason: this._reason,
    };
  }
}

export class Task {
  constructor(
    public readonly id: string,
    public readonly goal: string,
    readonly actions: TaskAction[],
    private _status: TaskStatus,
    private _reason: string | undefined = undefined,
  ) {}

  static InitPending(goal: string, actions: ManagerAgentAction[]) {
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

  get nextPendingAction(): TaskAction | null {
    return this.pendingActions[0] ?? null;
  }

  completeAction(id: string) {
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

  cancelAction(id: string, reason: string) {
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

  cancel(reason: string) {
    this._status = 'cancelled';
    this._reason = reason;
  }

  fail(reason: string) {
    this._status = 'failed';
    this._reason = reason;
  }

  public objectForLLM() {
    return {
      goal: this.goal,
      actionsTaken: this.actions.map((action) => action.objectForLLM()),
    };
  }

  public serialize(): string {
    return JSON.stringify({
      id: this.id,
      goal: this.goal,
      actions: this.actions.map((action) => action.asObject()),
      status: this.status,
      reason: this.reason,
    });
  }

  public asObject() {
    return {
      id: this.id,
      goal: this.goal,
      actions: this.actions.map((action) => action.asObject()),
      status: this.status,
      reason: this.reason,
    };
  }
}
