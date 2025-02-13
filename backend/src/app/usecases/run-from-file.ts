import { TaskManagerService } from '@/core/services/task-manager-service';
import { ManagerAgent } from '@/core/agents/manager-agent/manager-agent';
import { DomService } from '@/infra/services/dom-service';
import { OpenAI4o } from '@/infra/services/openai4o';
import { InMemoryFileSystem } from '@/infra/services/in-memory-file-system';
import { PlaywrightScreenshoter } from '@/infra/services/playwright-screenshotter';
import { ChromiumBrowser } from '@/infra/services/chromium-browser';

import {
  DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
  DEFAULT_AGENT_MAX_RETRIES,
} from '@/core/agents/manager-agent/manager-agent.config';
import { OraReporter } from '@/infra/services/ora-reporter';
import * as fs from 'fs/promises';
import { Variable } from '@/core/entities/variable';
import { EventBus } from '@/core/services/realtime-reporter';
import { PersistResultService, TaskResult } from '../services/persist-result';
import { EvaluationAgent } from '@/core/agents/evaluation-agent/evaluation-agent';
import { LocalFileSystem } from '@/infra/services/local-file-system';
import { FeedbackAgent } from '@/core/agents/feedback-agent/feedback-agent';
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
