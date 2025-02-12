import { RunTestCase } from '@/app/usecases/run-test-case';
import { Command, program } from 'commander';
import ora from 'ora-classic';
import 'dotenv/config';
import { RunFromFile } from '@/app/usecases/run-from-file';
import { EventBus } from '@/core/services/realtime-reporter';

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
  .option(
    '-s, --user-story <USER STORY DESCRIPTION>',
    'The description of the user story to test',
  )
  .action(async (options: { url: string; userStory: string; file: string }) => {
    const runTestCase = new RunTestCase();
    const runFromFile = new RunFromFile();

    if (!options.file && (!options.url || !options.userStory)) {
      console.log(
        '--url and --user-story arguments are required if no --file is provided',
      );
      return;
    }

    if (options.url && options.userStory) {
      const result = await runTestCase.execute(
        options.url,
        options.userStory,
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

export default {
  startTest,
};
