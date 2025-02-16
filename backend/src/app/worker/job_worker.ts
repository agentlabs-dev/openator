import { parentPort, workerData } from 'worker_threads';
import { RunService } from '../services/run-service';
import { Job } from '@/core/entities/job';
import { EventBus } from '@/core/services/realtime-reporter';
import { RunAdapter } from '@/interfaces/api/adapters/run-adapter';

export const main = async () => {
  const { job, options } = workerData as {
    job: Job;
    options: {
      headless: boolean;
    };
  };

  try {
    const eventBus = new EventBus();

    eventBus.on('run:update', (data) => {
      parentPort?.postMessage({
        type: 'run:update',
        data: RunAdapter.toFrontend(data),
      });
    });

    await new RunService().runJob(job, eventBus, options);
  } catch (error) {
    parentPort?.postMessage({
      success: false,
      error: error.message,
    });
  }
};

main();
