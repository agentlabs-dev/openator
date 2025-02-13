import * as fs from 'fs/promises';
import { VoyagerTask } from '../types/voyager-task';
import { RunService } from '../services/run-service';

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

export class RunFromFile {
  async execute(filePath: string) {
    let fileContent: string;

    try {
      fileContent = await fs.readFile(filePath, 'utf-8');
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

    for (const [index, testCase] of parsedContent.tasks.entries()) {
      console.log(`TEST ${index + 1} of ${parsedContent.tasks.length}`);
      await new RunService().runVoyagerTask(testCase, persistResultPath);
    }
  }
}
