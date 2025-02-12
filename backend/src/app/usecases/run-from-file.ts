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

interface TaskCase {
  web: string;
  ques: string;
  id: string;
  web_name: string;
}

interface ParsedContent {
  context: {
    variables: {
      name: string;
      value: string;
      is_secret: boolean;
    }[];
  };
  tasks: TaskCase[];
}

export class RunFromFile {
  async execute(filePath: string) {
    const results: { success: boolean; reason: string; case: TaskCase }[] = [];

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

    const context = parsedContent.context;

    for (const [index, testCase] of parsedContent.tasks.entries()) {
      const {
        web: startUrl,
        ques: userStory,
        web_name: webName,
        id: taskId,
      } = testCase;

      console.log('--------------------------------');
      console.log(
        `TEST ${index + 1} of ${parsedContent.tasks.length} - ${webName} - ${taskId}`,
      );
      console.log('--------------------------------');

      const fileSystem = new InMemoryFileSystem();
      const screenshotService = new PlaywrightScreenshoter(fileSystem);
      const browser = new ChromiumBrowser();

      const llm = new OpenAI4o();

      const managerAgent = new ManagerAgent({
        variables: context.variables.map(
          (variable) =>
            new Variable({
              name: variable.name,
              value: variable.value,
              isSecret: variable.is_secret,
            }),
        ),
        reporter: new OraReporter('Manager Agent'),
        taskManager: new TaskManagerService(),
        domService: new DomService(screenshotService, browser),
        browserService: browser,
        llmService: llm,
        maxActionsPerTask: DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
        maxRetries: DEFAULT_AGENT_MAX_RETRIES,
        eventBus: new EventBus(),
      });

      const result = await managerAgent.launch(startUrl, userStory);

      console.log('RESULT', result);

      results.push({
        success: result.status === 'passed',
        reason: result.status,
        case: testCase,
      });
    }

    return results;
  }
}
