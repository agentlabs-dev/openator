import { VoyagerTask } from '../types/voyager-task';
import { resolve as resolvePath } from 'path';
import { readFile } from 'fs-extra';
import { Worker } from 'worker_threads';
import { RunVoyagerTaskOptions } from '../services/run-service';

export const DEFAULT_THREAD_COUNT = 1;

export interface RunParallelFromFileOptions {
  web?: string;
  threads: number;
  headless: boolean;
  resultOutputPath: string;
}

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
  async runWorker(task: VoyagerTask, options: RunVoyagerTaskOptions) {
    return new Promise<void>((resolve, reject) => {
      const workerInstance = new Worker(
        resolvePath(__dirname, '../worker/worker.ts'),
        {
          workerData: { task, options },
          execArgv: ['-r', 'ts-node/register', '-r', 'tsconfig-paths/register'],
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
  }

  async execute(filePath: string, options: RunParallelFromFileOptions) {
    let fileContent: string;

    try {
      fileContent = await readFile(filePath, 'utf-8');
    } catch (error: any) {
      throw new Error(`Failed to read file at ${filePath}: ${error?.message}`);
    }

    let parsedContent: ParsedContent;
    try {
      parsedContent = JSON.parse(fileContent) as ParsedContent;

      if (!!options.web?.length) {
        parsedContent.tasks = parsedContent.tasks.filter(
          (task) => task.web_name === options.web,
        );
      }
    } catch (error: any) {
      throw new Error(
        `Failed to parse JSON content from file at ${filePath}: ${error?.message}`,
      );
    }

    const maxWorkers = options.threads ?? DEFAULT_THREAD_COUNT;
    const workers: Promise<void>[] = [];

    for (const [index, testCase] of parsedContent.tasks.entries()) {
      if (workers.length >= maxWorkers) {
        await Promise.race(workers); // Wait for one worker to complete before spawning another
      }

      const worker = this.runWorker(testCase, {
        headless: options.headless,
        resultOutputPath: options.resultOutputPath,
      });

      worker.then(() => {
        workers.splice(workers.indexOf(worker), 1);
      });

      console.log('Spawning worker', index);
      workers.push(worker);
    }
  }
}
