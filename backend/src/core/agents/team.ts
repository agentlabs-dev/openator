import { InMemoryFileSystem } from '@/infra/services/in-memory-file-system';
import { initStrategist } from './user-journey-strategist/user-journey-strategist';
import { PlaywrightScreenshoter } from '@/infra/services/playwright-screenshotter';
import { ChromiumBrowser } from '@/infra/services/chromium-browser';
import { OpenAI4o } from '@/infra/services/openai4o';
import { TaskManagerService } from '../services/task-manager-service';
import { DomService } from '@/infra/services/dom-service';
import { OraReporter } from '@/infra/services/ora-reporter';
import {
  DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
  DEFAULT_AGENT_MAX_RETRIES,
} from './manager-agent/manager-agent.config';
import { EventBus } from '../services/realtime-reporter';
import { FeedbackAgent } from './feedback-agent/feedback-agent';
import { BrowserAgent } from './browser-agent/browser-agent';
import { ChatMessage } from './chat-agent-base';

const fileSystem = new InMemoryFileSystem();
const screenshotService = new PlaywrightScreenshoter(fileSystem);
const browser = new ChromiumBrowser({
  headless: false,
});
const eventBus = new EventBus();

const llm = new OpenAI4o();

const browserAgent = new BrowserAgent({
  variables: [],
  taskManager: new TaskManagerService(),
  domService: new DomService(screenshotService, browser, eventBus),
  browserService: browser,
  feedbackAgent: new FeedbackAgent(llm),
  llmService: llm,
  reporter: new OraReporter('Browser Agent'),
  maxActionsPerTask: DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
  maxRetries: DEFAULT_AGENT_MAX_RETRIES,
  eventBus,
});

export class Team {
  private readonly strategist = initStrategist();
  private readonly browserAgent = browserAgent;

  constructor(
    public readonly startUrl: string,
    public readonly endGoal: string,
  ) {}

  async kickoff() {
    let finalResult = null;

    const { screenshot, pageUrl } =
      await this.browserAgent.getInitialPageReport(this.startUrl);

    this.strategist.addMessage(
      new ChatMessage({
        role: 'user',
        text: `
        ## End goal: ${this.endGoal}.
        
        ## Current page url: ${pageUrl}
        
        ## Current page screenshot will follow:
        `,
        images: [screenshot],
      }),
    );

    const result = await this.strategist.answer();

    if (result.finalAnswer) {
      console.log('*** FINAL ANSWER ***');
      console.log(result.finalAnswer);
    }

    return this.run(result.nextTask);
  }

  async run(initialTask: string) {
    let nextTask = initialTask;
    let finalAnswer = null;
    while (!finalAnswer) {
      this.browserAgent.setNewGoal(nextTask);
      const runResult = await this.browserAgent.run();

      console.log('*** RUN RESULT ***');
      console.log(JSON.stringify(runResult.answer, null, 2));

      this.strategist.addMessage(
        new ChatMessage({
          role: 'user',
          text: `
           ## Browser agent response: ${runResult.answer}
           
           ## Browser agent extracted content: ${runResult.extractedContentSummary}

           ## Browser agent step count: ${runResult.stepCount}

           ## Browser agent status: ${runResult.status}

           ## Browser agent reason: ${runResult.reason}

           ## Browser agent screenshot:
           `,
          images: [runResult.screenshot],
        }),
      );

      const sResult = await this.strategist.answer();

      if (sResult.finalAnswer) {
        finalAnswer = sResult.finalAnswer;
      }
      nextTask = sResult.nextTask;

      console.log('*** NEXT TASK ***');
      console.log(JSON.stringify(sResult, null, 2));
    }

    console.log('*** FINAL ANSWER ***');
    console.log(finalAnswer);

    return finalAnswer;
  }
}
