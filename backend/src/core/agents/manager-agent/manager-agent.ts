import { TaskManagerService } from '@/core/services/task-manager-service';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import {
  ManagerAgentPrompt,
  ManagerAgentHumanPrompt,
} from './manager-agent.prompt';
import { DomService } from '@/infra/services/dom-service';
import {
  DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
  DEFAULT_AGENT_MAX_RETRIES,
} from './manager-agent.config';
import { ManagerAgentAction, ManagerResponse } from './manager-agent.types';
import { Browser, Coordinates } from '@/core/interfaces/browser.interface';
import { EvaluationAgent } from '../evaluation-agent/evaluation-agent';
import { Task, TaskAction } from '@/core/entities/task';
import { LLM } from '@/core/interfaces/llm.interface';
import { TestResult } from '@/core/entities/test-result';
import { AgentReporter } from '@/core/interfaces/agent-reporter.interface';
import { Variable } from '@/core/entities/variable';
import { VariableString } from '@/core/entities/variable-string';
import { Run } from '@/core/entities/run';
import { EventBusInterface } from '@/core/interfaces/event-bus.interface';

export type ManagerAgentConfig = {
  maxActionsPerTask?: number;
  maxRetries?: number;
  variables: Variable[];

  taskManager: TaskManagerService;
  domService: DomService;
  browserService: Browser;
  llmService: LLM;
  evaluator: EvaluationAgent;
  reporter: AgentReporter;
  eventBus: EventBusInterface;
};

export class ManagerAgent {
  private msDelayBetweenActions: number = 1000;
  private lastDomStateHash: string | null = null;
  private isSuccess: boolean = false;
  private isFailure: boolean = false;
  private reason: string = '';
  private retries: number = 0;
  private readonly variables: Variable[];
  private currentRun: Run | null = null;

  private readonly maxActionsPerTask: number;
  private readonly maxRetries: number;

  private readonly taskManager: TaskManagerService;
  private readonly domService: DomService;
  private readonly browserService: Browser;
  private readonly llmService: LLM;
  private readonly reporter: AgentReporter;
  private readonly evaluator: EvaluationAgent;
  private readonly eventBus: EventBusInterface;

  constructor(config: ManagerAgentConfig) {
    this.taskManager = config.taskManager;
    this.domService = config.domService;
    this.browserService = config.browserService;
    this.llmService = config.llmService;
    this.reporter = config.reporter;
    this.evaluator = config.evaluator;
    this.variables = config.variables;

    this.maxActionsPerTask =
      config.maxActionsPerTask ?? DEFAULT_AGENT_MAX_ACTIONS_PER_TASK;
    this.maxRetries = config.maxRetries ?? DEFAULT_AGENT_MAX_RETRIES;
    this.eventBus = config.eventBus;
  }

  private onSuccess(reason: string) {
    this.reporter.success(`Manager agent completed successfully: ${reason}`);
    this.isSuccess = true;
    this.reason = reason;
  }

  private onFailure(reason: string) {
    this.reporter.failure(`Manager agent failed: ${reason}`);
    this.isFailure = true;
    this.reason = reason;
  }

  private async beforeAction(action: TaskAction) {
    this.reporter.loading(`Performing action ${action.data.name}...`);
  }

  private async afterAction(action: TaskAction) {
    this.reporter.success(`Performing action ${action.data.name}...`);
  }

  private async incrementRetries() {
    this.retries += 1;
  }

  private async resetRetries() {
    this.retries = 0;
  }

  get isCompleted() {
    return this.isSuccess || this.isFailure;
  }

  async launch(startUrl: string, initialPrompt: string) {
    const vStartUrl = new VariableString(startUrl, this.variables);

    await this.browserService.launch(vStartUrl.dangerousValue());

    const vInitialPrompt = new VariableString(initialPrompt, this.variables);

    this.taskManager.setEndGoal(vInitialPrompt.publicValue());

    return this.run();
  }

  private async emitRunUpdate() {
    this.eventBus.emit('run:update', this.currentRun);
  }

  async run(): Promise<TestResult> {
    return new Promise(async (resolve) => {
      this.reporter.loading('Starting manager agent');

      this.currentRun = Run.InitRunning();
      this.emitRunUpdate();

      while (!this.isCompleted) {
        if (this.retries >= this.maxRetries) {
          this.onFailure('Max retries reached');

          return resolve({
            status: 'failed',
            reason:
              'Max number of retried reached. The agent was not able to complete the test.',
          });
        }

        this.reporter.loading('Defining next task...');

        const task = await this.defineNextTask();

        this.currentRun.addTask(task);
        this.currentRun.executeAction();

        this.emitRunUpdate();

        this.reporter.loading(`Executing task: ${task.goal}`);

        await this.executeTask(task);
      }

      /**
       * If the Manager Agent failed, then we return the failure reason immediately.
       */
      if (this.isFailure) {
        this.currentRun.setFailure(this.reason);
        this.emitRunUpdate();

        return resolve({
          status: 'failed',
          reason: this.reason,
        });
      }

      await this.domService.resetHighlightElements();

      /**
       * If the Manager Agent completed the task, then we evaluate the test result.
       */
      const { status, reason } = await this.evaluator.evaluateTestResult(
        this.taskManager.getSerializedTasks(),
        this.taskManager.getEndGoal(),
      );

      if (status === 'passed') {
        this.currentRun.setSuccess(reason);
      } else {
        this.currentRun.setFailure(reason);
      }

      this.emitRunUpdate();

      return resolve({
        status,
        reason,
      });
    });
  }

  private async didDomStateChange() {
    const { domStateHash: currentDomStateHash } =
      await this.domService.getInteractiveElements(false);

    return this.lastDomStateHash !== currentDomStateHash;
  }

  /**
   * Ensures that the triggerSuccess and triggerFailure actions are never called among other actions.
   * This is important because we need to reevaluate actions and ensure that the success or failure
   * actions are executed alone to properly determine the test result.
   */
  private ensureNoTriggerSuccessOrFailureAmongOtherActions(
    actions: ManagerAgentAction[],
  ) {
    if (actions.length < 2) {
      return actions;
    }

    return actions.filter(
      (action) =>
        action.name !== 'triggerSuccess' && action.name !== 'triggerFailure',
    );
  }

  async defineNextTask(): Promise<Task> {
    this.currentRun.think();
    this.emitRunUpdate();

    const parser = new JsonOutputParser<ManagerResponse>();

    const systemMessage = new ManagerAgentPrompt(
      this.maxActionsPerTask,
    ).getSystemMessage();

    const { screenshot, stringifiedDomState, domStateHash } =
      await this.domService.getInteractiveElements();

    this.lastDomStateHash = domStateHash;

    const humanMessage = new ManagerAgentHumanPrompt().getHumanMessage({
      serializedTasks: this.taskManager.getSerializedTasks(),
      screenshotUrl: screenshot,
      stringifiedDomState,
      pageUrl: this.browserService.getPageUrl(),
    });

    const messages = [systemMessage, humanMessage];

    try {
      const parsedResponse = await this.llmService.invokeAndParse(
        messages,
        parser,
      );

      const safeActions = this.ensureNoTriggerSuccessOrFailureAmongOtherActions(
        parsedResponse.actions,
      );

      const task = Task.InitPending(
        parsedResponse.currentState.nextGoal,
        safeActions,
      );

      this.taskManager.add(task);

      return task;
    } catch (error) {
      console.error('Error parsing agent response:', error);
      return Task.InitPending('Keep trying', []);
    }
  }

  debugRun() {
    console.log('this.currentRun', JSON.stringify(this.currentRun, null, 2));
  }

  async executeTask(task: Task) {
    task.start();

    this.debugRun();

    await this.domService.resetHighlightElements();

    for (const [i, action] of task.actions.entries()) {
      try {
        action.start();
        this.emitRunUpdate();

        if (i > 0 && (await this.didDomStateChange())) {
          action.cancel('Dom state changed, need to reevaluate.');
          task.cancel('Dom state changed, need to reevaluate.');
          this.taskManager.update(task);
          this.reporter.info('Dom state changed, need to reevaluate.');
          return;
        }

        await this.executeAction(action);
        action.complete();
        this.emitRunUpdate();

        await new Promise((resolve) =>
          setTimeout(resolve, this.msDelayBetweenActions),
        );

        task.complete();
        this.emitRunUpdate();
        this.resetRetries();
        this.taskManager.update(task);
      } catch (error: any) {
        action.fail(
          `Task failed with error: ${error?.message ?? 'Unknown error'}`,
        );
        task.fail(
          `Task failed with error: ${error?.message ?? 'Unknown error'}`,
        );

        this.taskManager.update(task);
        this.incrementRetries();
        this.emitRunUpdate();
      }
    }

    this.taskManager.add(task);

    this.reporter.success(task.goal);
  }

  private async executeAction(action: TaskAction) {
    let coordinates: Coordinates | null = null;

    await this.beforeAction(action);

    this.emitRunUpdate();

    switch (action.data.name) {
      case 'clickElement':
        coordinates = this.domService.getIndexSelector(
          action.data.params.index,
        );

        if (!coordinates) {
          throw new Error('Index or coordinates not found');
        }

        await this.domService.resetHighlightElements();

        await this.domService.highlightElementPointer(coordinates);

        await this.browserService.mouseClick(coordinates.x, coordinates.y);

        await this.domService.resetHighlightElements();

        break;

      case 'fillInput':
        coordinates = this.domService.getIndexSelector(
          action.data.params.index,
        );

        if (!coordinates) {
          throw new Error('Index or coordinates not found');
        }

        await this.domService.highlightElementPointer(coordinates);
        const variableString = new VariableString(
          action.data.params.text,
          this.variables,
        );

        await this.browserService.fillInput(variableString, coordinates);
        await this.domService.resetHighlightElements();

        break;

      case 'scrollDown':
        await this.browserService.scrollDown();
        await this.domService.resetHighlightElements();
        await this.domService.highlightElementWheel('down');

        break;

      case 'scrollUp':
        await this.browserService.scrollUp();

        await this.domService.resetHighlightElements();
        await this.domService.highlightElementWheel('up');

        break;

      case 'takeScreenshot':
        await this.domService.resetHighlightElements();
        await this.domService.highlightForSoM();
        break;

      case 'goToUrl':
        await this.browserService.goToUrl(action.data.params.url);
        break;

      case 'triggerSuccess':
        this.onSuccess(action.data.params.reason);
        break;

      case 'triggerFailure':
        this.onFailure(action.data.params.reason);
        break;
    }

    await this.afterAction(action);
    this.emitRunUpdate();
  }
}
