import { parentPort, workerData } from 'worker_threads';
import { RunService } from '../services/run-service';
import { VoyagerTask } from '../types/voyager-task';

export const main = async () => {
  const { task, options } = workerData as {
    task: VoyagerTask;
    options: {
      persistResultPath: string;
      headless: boolean;
    };
  };

  try {
    await new RunService().runVoyagerTaskV2(task, options);

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
