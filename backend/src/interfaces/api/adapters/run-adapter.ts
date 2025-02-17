import { Run } from '@/core/entities/run';
import { TaskAdapter } from './task-adapter';

export class RunAdapter {
  static toFrontend(run: Run) {
    console.log('run', run);
    return {
      id: run.id,
      status: run.status,
      tasks: run.tasks.map((task) => TaskAdapter.toFrontend(task)),
      brainState: run.brainState,
      resultReason: run.resultReason,
      result: run.result,
      scenario: run.scenario,
    };
  }
}
