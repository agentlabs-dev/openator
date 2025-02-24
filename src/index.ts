import { FeedbackAgent } from './core/agents/feedback-agent/feedback-agent';
import { Openator } from './core/agents/openator/openator';
import {
  initSummarizer,
  initSummarizeTask,
} from './core/agents/summarize-agent/summarize-agent';
import { EventBus } from './core/services/realtime-reporter';
import { TaskManagerService } from './core/services/task-manager-service';
import { Variable } from './core/types';
import { ChromiumBrowser } from './infra/services/chromium-browser';
import { ConsoleReporter } from './infra/services/console-reporter';
import { DomService } from './infra/services/dom-service';
import { InMemoryFileSystem } from './infra/services/in-memory-file-system';
import { OpenAI4o } from './infra/services/openai4o';
import { PlaywrightScreenshoter } from './infra/services/playwright-screenshotter';

export * from './core/types';

export type InitOpenatorOptions = {
  /**
   * Whether to run the browser in headless mode.
   * @default false
   */
  headless: boolean;
  /**
   * The OpenAI API key.
   * Feel free to submit a PR to support other LLMs - you only need to implement the LLM interface.
   */
  openAiApiKey: string;
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

export const initOpenator = (options: InitOpenatorOptions): Openator => {
  const fileSystem = new InMemoryFileSystem();
  const screenshotService = new PlaywrightScreenshoter(fileSystem);

  const browser = new ChromiumBrowser({
    headless: options.headless,
  });

  const llm = new OpenAI4o(options.openAiApiKey);

  const eventBus = new EventBus();

  const domService = new DomService(screenshotService, browser, eventBus);
  const feedbackAgent = new FeedbackAgent(llm);
  const taskManager = new TaskManagerService();

  const summarizer = initSummarizer(options.openAiApiKey, llm);
  const summarizeTask = initSummarizeTask();

  return new Openator({
    variables: options.variables ?? [],
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
