import { Run } from '@/core/entities/run';
import { Task } from '@/core/entities/task';
import { TaskActionAdapter } from './task-action-adapter';

export class TaskAdapter {
  static toFrontend(task: Task) {
    return {
      id: task.id,
      status: task.status,
      description: task.goal,
      actions: task.actions.map((action) =>
        TaskActionAdapter.toFrontend(action),
      ),
    };
  }
}
