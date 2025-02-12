import { Worker } from 'worker_threads';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async runVoyagerExample() {
    const createWorker = async () => {
      return new Promise<number>((resolve, reject) => {
        const worker = new Worker(
          path.resolve(__dirname, 'worker/run-from-file'),
          {
            workerData: {},
            execArgv: [
              '-r',
              'ts-node/register',
              '-r',
              'tsconfig-paths/register',
            ],
          },
        );

        worker.on('error', (error) => {
          console.error(error);
        });

        worker.on('exit', (code) => {
          console.log('worker exited with code', code);
        });
      });
    };

    try {
      await createWorker();
    } catch (error) {
      console.error(error);
    }

    return {
      success: true,
    };
  }
}
