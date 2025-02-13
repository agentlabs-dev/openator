import { EvaluationAgent } from '@/core/agents/evaluation-agent/evaluation-agent';
import { FeedbackAgent } from '@/core/agents/feedback-agent/feedback-agent';
import { ManagerAgent } from '@/core/agents/manager-agent/manager-agent';
import {
  DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
  DEFAULT_AGENT_MAX_RETRIES,
} from '@/core/agents/manager-agent/manager-agent.config';
import { EventBus } from '@/core/services/realtime-reporter';
import { TaskManagerService } from '@/core/services/task-manager-service';
import { ChromiumBrowser } from '@/infra/services/chromium-browser';
import { DomService } from '@/infra/services/dom-service';
import { InMemoryFileSystem } from '@/infra/services/in-memory-file-system';
import { LocalFileSystem } from '@/infra/services/local-file-system';
import { OpenAI4o } from '@/infra/services/openai4o';
import { OraReporter } from '@/infra/services/ora-reporter';
import { PlaywrightScreenshoter } from '@/infra/services/playwright-screenshotter';
import { PersistResultService, TaskResult } from './persist-result';
import { VoyagerTask } from '../types/voyager-task';

export class RunService {
  constructor() {}

  async runVoyagerTask(task: VoyagerTask, persistResultPath?: string) {
    const {
      web: startUrl,
      ques: userStory,
      web_name: webName,
      id: taskId,
    } = task;

    console.log('--------------------------------');
    console.log(`TEST ${webName} - ${taskId}`);
    console.log('--------------------------------');

    const fileSystem = new InMemoryFileSystem();
    const screenshotService = new PlaywrightScreenshoter(fileSystem);
    const browser = new ChromiumBrowser();

    const llm = new OpenAI4o();

    const eventBus = new EventBus();

    const localFileSystem = new LocalFileSystem();

    const screenshotUrls: string[] = [];

    eventBus.on('pristine-screenshot:taken', async (screenshotData: string) => {
      const buffer = localFileSystem.bufferFromStringUrl(screenshotData);
      const screenshotFileName = `screenshot_${webName}_${taskId}_${Date.now()}.png`;
      await localFileSystem.saveScreenshot(screenshotFileName, buffer);

      screenshotUrls.push(screenshotData);
    });

    const feedbackAgent = new FeedbackAgent(llm);

    const startTime = new Date();

    const managerAgent = new ManagerAgent({
      variables: [],
      reporter: new OraReporter('Manager Agent'),
      taskManager: new TaskManagerService(),
      domService: new DomService(screenshotService, browser, eventBus),
      browserService: browser,
      feedbackAgent,
      llmService: llm,
      maxActionsPerTask: DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
      maxRetries: DEFAULT_AGENT_MAX_RETRIES,
      eventBus,
    });

    const { result, stepCount } = await managerAgent.launch(
      startUrl,
      userStory,
    );
    const endTime = new Date();
    const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

    const evalResult = await new EvaluationAgent(llm).evaluate({
      screenshotUrls,
      task: userStory,
      answer: result,
      memory: managerAgent.memoryLearnings.join('\n'),
    });

    const taskResult: TaskResult = {
      web_name: webName,
      task_id: taskId,
      task_prompt: userStory,
      web: startUrl,
      result: result,
      step_count: stepCount,
      start_time: startTime,
      end_time: endTime,
      duration_seconds: durationSeconds,
      eval_result: evalResult.result,
      eval_reason: evalResult.explanation,
    };

    if (persistResultPath) {
      const persistResultService = new PersistResultService(persistResultPath);
      persistResultService.storeResult(taskResult);
    }
  }
}
