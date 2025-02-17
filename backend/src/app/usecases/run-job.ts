import { Worker } from 'worker_threads';
import { EventBus } from '@/core/services/realtime-reporter';
import { Job } from '@/core/entities/job';
import { resolve as resolvePath } from 'path';
import { HyperBrowserServer } from '@/infra/services/hyperbrowser-server';

export class RunJobUsecase {
  constructor() {}

  async runWorker(job: Job, eventBus: EventBus) {
    return new Promise<void>((resolve, reject) => {
      const workerInstance = new Worker(
        resolvePath(__dirname, '../worker/job_worker'),
        {
          workerData: { job },
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

    const hyperBrowserServer = new HyperBrowserServer();
    const session = await hyperBrowserServer.startSession();

    this.runWorker(
      {
        id: jobId,
        startUrl,
        scenario,
        wsEndpoint: session.wsEndpoint,
        sessionId: session.id,
        liveUrl: session.liveUrl,
      },
      eventBus,
    );

    return { jobId, sessionId: session.id, liveUrl: session.liveUrl };
  }
}
