import { TaskManagerService } from '@/core/services/task-manager-service';
import { ManagerAgent } from '@/core/agents/manager-agent/manager-agent';
import { DomService } from '@/infra/services/dom-service';
import { OpenAI4o } from '@/infra/services/openai4o';
import { InMemoryFileSystem } from '@/infra/services/in-memory-file-system';
import { PlaywrightScreenshoter } from '@/infra/services/playwright-screenshotter';
import { ChromiumBrowser } from '@/infra/services/chromium-browser';
import { EvaluationAgent } from '@/core/agents/evaluation-agent/evaluation-agent';
import {
  DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
  DEFAULT_AGENT_MAX_RETRIES,
} from '@/core/agents/manager-agent/manager-agent.config';
import { OraReporter } from '@/infra/services/ora-reporter';
import * as fs from 'fs/promises';
import { Variable } from '@/core/entities/variable';
import { EventBus } from '@/core/services/realtime-reporter';

interface TestCase {
  start_url: string;
  user_story: string;
}

interface ParsedContent {
  context: {
    variables: {
      name: string;
      value: string;
      is_secret: boolean;
    }[];
  };
  cases: TestCase[];
}

export class RunFromFile {
  async execute(filePath: string) {
    const results: { success: boolean; reason: string; case: TestCase }[] = [];

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

    for (const [index, testCase] of parsedContent.cases.entries()) {
      const { start_url: startUrl, user_story: userStory } = testCase;

      console.log('--------------------------------');
      console.log(`TEST ${index + 1} of ${parsedContent.cases.length}`);
      console.log('--------------------------------');

      const fileSystem = new InMemoryFileSystem();
      const screenshotService = new PlaywrightScreenshoter(fileSystem);
      const browser = new ChromiumBrowser();

      const llm = new OpenAI4o();

      const evaluationAgent = new EvaluationAgent(
        llm,
        browser,
        screenshotService,
        new OraReporter('Evaluation Agent'),
      );

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
        evaluator: evaluationAgent,
        taskManager: new TaskManagerService(),
        domService: new DomService(screenshotService, browser),
        browserService: browser,
        llmService: llm,
        maxActionsPerTask: DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
        maxRetries: DEFAULT_AGENT_MAX_RETRIES,
        eventBus: new EventBus(),
      });

      const result = await managerAgent.launch(startUrl, userStory);

      results.push({
        success: result.status === 'passed',
        reason: result.status,
        case: testCase,
      });
    }

    return results;
  }
}
