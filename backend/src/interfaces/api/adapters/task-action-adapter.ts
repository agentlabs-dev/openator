import { TaskAction } from '@/core/entities/task';

export class TaskActionAdapter {
  static toFrontend(taskAction: TaskAction) {
    return {
      id: taskAction.id,
      description: taskAction.data.description,
      status: taskAction.status,
      name: taskAction.data.name,
    };
  }
}
