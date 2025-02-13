import { VoyagerTask } from '../types/voyager-task';
import { resolve as resolvePath } from 'path';
import { readFile } from 'fs-extra';
import { Worker } from 'worker_threads';

interface ParsedContent {
  context: {
    variables: {
      name: string;
      value: string;
      is_secret: boolean;
    }[];
  };
  tasks: VoyagerTask[];
}

export class RunParallelFromFile {
  async execute(filePath: string) {
    let fileContent: string;

    try {
      console.log('------------Reading file', filePath);
      fileContent = await readFile(filePath, 'utf-8');
    } catch (error: any) {
      throw new Error(`Failed to read file at ${filePath}: ${error?.message}`);
    }

    let parsedContent: ParsedContent;
    try {
      parsedContent = JSON.parse(fileContent) as ParsedContent;
    } catch (error: any) {
      throw new Error(
        `Failed to parse JSON content from file at ${filePath}: ${error?.message}`,
      );
    }

    const persistResultPath = '/tmp/results.json';
    const maxWorkers = 6;
    const workers: Promise<void>[] = [];

    for (const [index, testCase] of parsedContent.tasks.entries()) {
      if (workers.length >= maxWorkers) {
        await Promise.race(workers); // Wait for one worker to complete before spawning another
      }

      const worker = new Promise<void>((resolve, reject) => {
        const workerInstance = new Worker(
          resolvePath(__dirname, '../worker/worker.ts'),
          {
            workerData: { task: testCase, persistResultPath },
            execArgv: [
              '-r',
              'ts-node/register',
              '-r',
              'tsconfig-paths/register',
            ],
          },
        );

        workerInstance.on('message', (msg) => {
          console.log(`Task ${msg.taskId} completed successfully`);
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

      console.log('Spawning worker', index);
      workers.push(worker);
    }
  }
}
