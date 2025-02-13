import { RunTestCase } from '@/app/usecases/run-test-case';
import { Command, program } from 'commander';
import ora from 'ora-classic';
import 'dotenv/config';
import { RunFromFile } from '@/app/usecases/run-from-file';
import { EventBus } from '@/core/services/realtime-reporter';
import { RunParallelFromFile } from '@/app/usecases/run-parallel-from-file';

if (!process.env.OPENAI_API_KEY) {
  console.error(
    'Error: OPENAI_API_KEY is not set in the environment variables.',
  );
  process.exit(1);
}

export const startTest = new Command('run:scenario')
  .description('Run a test scenario')
  .option('-f, --file <FILE>', 'Import a test file containing the test cases')
  .option('-u, --url <URL>', 'The webpage to start testing')
  .option('-t, --task <TASK DESCRIPTION>', 'The task to perform')
  .action(async (options: { url: string; task: string; file: string }) => {
    const runTestCase = new RunTestCase();
    const runFromFile = new RunFromFile();

    if (!options.file && (!options.url || !options.task)) {
      console.log(
        '--url and --task arguments are required if no --file is provided',
      );
      return;
    }

    if (options.url && options.task) {
      const result = await runTestCase.execute(
        options.url,
        options.task,
        new EventBus(),
      );

      if (result.status === 'passed') {
        console.log('✅ Tests completed successfully!');
      } else {
        console.log('❌ Tests failed');
      }
    }

    if (options.file) {
      const result = await runFromFile.execute(options.file);
    }
  });

export const bench = new Command('run:benchmark')
  .description('Start the voyager benchmark')
  .option(
    '-f --file <FILE>',
    'Import a test file containing the webvoyager test cases',
  )
  .action(async (options: { file: string }) => {
    const runParallelFromFile = new RunParallelFromFile();
    const file =
      options.file ||
      '/Users/kevinpiacentini/Projects/openator/examples/web-voyager-questions.json';
    await runParallelFromFile.execute(file);
  });

export default {
  startTest,
  bench,
};
