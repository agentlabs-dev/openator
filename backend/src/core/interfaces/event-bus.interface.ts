import { Run } from '../entities/run';
import { Task, TaskAction } from '../entities/task';

export type AppEvents = {
  'run:update': Run;
  'task:update': Task;
  'action:update': TaskAction;
};

export interface EventBusInterface {
  emit<E extends keyof AppEvents>(event: E, data: AppEvents[E]): void;
  on<E extends keyof AppEvents>(
    event: E,
    callback: (data: AppEvents[E]) => void,
  ): void;
}
