import { Worker } from 'worker_threads';
import { EventBus } from '@/core/services/realtime-reporter';
import { Job } from '@/core/entities/job';
import { resolve as resolvePath } from 'path';
import { RunAdapter } from '@/interfaces/api/adapters/run-adapter';
import { Run } from '@/core/entities/run';

export class RunJobUsecase {
  constructor() {}

  async runWorker(job: Job, eventBus: EventBus) {
    return new Promise<void>((resolve, reject) => {
      const workerInstance = new Worker(
        resolvePath(__dirname, '../worker/job_worker'),
        {
          workerData: { job, options: { headless: false } },
          execArgv: ['-r', 'ts-node/register', '-r', 'tsconfig-paths/register'],
        },
      );

      workerInstance.on('message', (msg) => {
        if (msg.type === 'run:update') {
          eventBus.emit('run:update', msg.data);
        } else {
          console.log(`Unknown message from worker: ${msg}`);
        }
        resolve();
      });

      workerInstance.on('error', (err) => {
        console.error(`Error in worker: ${err.message}`);
        reject(err);
      });

      workerInstance.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  async execute(startUrl: string, scenario: string, eventBus: EventBus) {
    const jobId = crypto.randomUUID();

    this.runWorker(
      {
        id: jobId,
        startUrl,
        scenario,
      },
      eventBus,
    );

    return jobId;
  }
}
