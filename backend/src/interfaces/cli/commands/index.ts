import { Command, program } from 'commander';
import { resolve as resolvePath } from 'path';
import 'dotenv/config';
import {
  DEFAULT_THREAD_COUNT,
  RunParallelFromFile,
} from '@/app/usecases/run-parallel-from-file';

if (!process.env.OPENAI_API_KEY) {
  console.error(
    'Error: OPENAI_API_KEY is not set in the environment variables.',
  );
  process.exit(1);
}

export const bench = new Command('run:benchmark')
  .description('Start the voyager benchmark')
  .option('--file <file>', 'The file containing the webvoyager test cases')
  .option(
    '--web <webName>',
    'The web_name to run the benchmark on (e.g. Allrecipes, Amazon). Default to all.',
  )
  .option(
    '--threads <threads>',
    'The number of threads to run the benchmark on.',
  )
  .option(
    '--headless',
    'Whether to run the benchmark in headless mode. Default to false.',
  )
  .option(
    '--output <resultOutputPath>',
    'The path to save the benchmark results. Default to eval/answers.json.',
  )
  .option('--id <taskId>', 'The task id to run. Default to all.')
  .action(
    async (options: {
      file?: string;
      web?: string;
      threads?: string;
      headless?: boolean;
      resultOutputPath?: string;
      id?: string;
    }) => {
      const runParallelFromFile = new RunParallelFromFile();

      const defaultFilePath = resolvePath(
        __dirname,
        '../../../../../examples/web-voyager-questions.json',
      );

      const defaultResultOutputPath = resolvePath(
        __dirname,
        '../../../../../eval/answers.json',
      );

      const filePath = options.file || defaultFilePath;
      await runParallelFromFile.execute(filePath, {
        web: options.web,
        taskId: options.id,
        threads: options.threads
          ? parseInt(options.threads)
          : DEFAULT_THREAD_COUNT,
        headless: !!options.headless,
        resultOutputPath: options.resultOutputPath ?? defaultResultOutputPath,
      });
    },
  );

export default {
  bench,
};
