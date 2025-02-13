import { parentPort, workerData } from 'worker_threads';
import { RunService } from '../services/run-service';
import { VoyagerTask } from '../types/voyager-task';

export const main = async () => {
  const { task, persistResultPath } = workerData as {
    task: VoyagerTask;
    persistResultPath: string;
  };

  try {
    await new RunService().runVoyagerTask(task, persistResultPath);

    parentPort?.postMessage({ success: true, taskId: task.id });
  } catch (error) {
    parentPort?.postMessage({
      success: false,
      error: error.message,
      taskId: workerData.task.id,
    });
  }
};

main();
