import { FeedbackAgent } from './core/agents/feedback-agent/feedback-agent';
import { Openator } from './core/agents/openator/openator';
import {
  initSummarizer,
  initSummarizeTask,
} from './core/agents/summarize-agent/summarize-agent';
import { EventBus } from './core/services/realtime-reporter';
import { TaskManagerService } from './core/services/task-manager-service';
import { ChromiumBrowser } from './infra/services/chromium-browser';
import { ConsoleReporter } from './infra/services/console-reporter';
import { DomService } from './infra/services/dom-service';
import { InMemoryFileSystem } from './infra/services/in-memory-file-system';
import { OpenAI4o } from './infra/services/openai4o';
import { PlaywrightScreenshoter } from './infra/services/playwright-screenshotter';

export type InitOpenatorOptions = {
  headless: boolean;
  openAiApiKey: string;
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
    variables: [],
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
