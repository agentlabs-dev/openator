import { FeedbackAgent } from './core/agents/feedback-agent/feedback-agent';
import { Openator } from './core/agents/openator/openator';
import {
  initSummarizer,
  initSummarizeTask,
} from './core/agents/summarize-agent/summarize-agent';
import { EventBus } from './core/services/realtime-reporter';
import { TaskManagerService } from './core/services/task-manager-service';
import { LLM, Variable } from './core/types';
import { ChromiumBrowser } from './infra/services/chromium-browser';
import { ConsoleReporter } from './infra/services/console-reporter';
import { DomService } from './infra/services/dom-service';
import { InMemoryFileSystem } from './infra/services/in-memory-file-system';
import { PlaywrightScreenshoter } from './infra/services/playwright-screenshotter';

export type InitOpenatorConfig = {
  /**
   * The LLM to use.
   * @default OpenAI4o
   */
  llm: LLM;
  /**
   * Whether to run the browser in headless mode.
   * @default false
   */
  headless: boolean;
  /**
   * Variables can be used to pass sensitive information to the Openator.
   * Every variable will be interpolated during the runtime from `{{variable_name}}` to the actual value.
   * Secret variables will be masked in the console output and never sent to the LLM.
   * Normal variables will be sent to the LLM and will be visible in the console output.
   *
   * @default []
   * @example ```
   * [ new Variable({ name: 'password', value: process.env.PASSWORD, isSecret: true }) ]
   * ```
   */
  variables?: Variable[];
};

export const initOpenator = (config: InitOpenatorConfig): Openator => {
  const fileSystem = new InMemoryFileSystem();
  const screenshotService = new PlaywrightScreenshoter(fileSystem);

  const browser = new ChromiumBrowser({
    headless: config.headless,
  });

  const llm = config.llm;

  const eventBus = new EventBus();

  const domService = new DomService(screenshotService, browser, eventBus);
  const feedbackAgent = new FeedbackAgent(llm);
  const taskManager = new TaskManagerService();

  const summarizer = initSummarizer(llm);
  const summarizeTask = initSummarizeTask();

  return new Openator({
    variables: config.variables ?? [],
    taskManager,
    domService,
    browserService: browser,
    llmService: llm,
    feedbackAgent,
    reporter: new ConsoleReporter('Openator'),
    summarizer,
    summarizeTask,
  });
};
