import { JsonOutputParser } from '@langchain/core/output_parsers';
import { ManagerAgentPrompt, ManagerAgentHumanPrompt } from './openator.prompt';
import { DEFAULT_AGENT_MAX_ACTIONS_PER_TASK, DEFAULT_AGENT_MAX_RETRIES, } from './openator.config';
import { Task } from '@/core/entities/task';
import { VariableString } from '@/core/entities/variable-string';
import { Run } from '@/core/entities/run';
export class Openator {
    constructor(config) {
        this.msDelayBetweenActions = 1000;
        this.lastDomStateHash = null;
        this.isSuccess = false;
        this.isFailure = false;
        this.reason = '';
        this.result = '';
        this.retries = 0;
        this.stepCount = 0;
        this.feedbackRetries = 0;
        this.currentRun = null;
        this.memoryLearnings = [];
        this.taskManager = config.taskManager;
        this.domService = config.domService;
        this.browserService = config.browserService;
        this.llmService = config.llmService;
        this.reporter = config.reporter;
        this.variables = config.variables;
        this.feedbackAgent = config.feedbackAgent;
        this.memoryLearnings = [];
        this.maxActionsPerTask =
            config.maxActionsPerTask ?? DEFAULT_AGENT_MAX_ACTIONS_PER_TASK;
        this.maxRetries = config.maxRetries ?? DEFAULT_AGENT_MAX_RETRIES;
        this.eventBus = config.eventBus;
        this.summarizer = config.summarizer;
        this.summarizeTask = config.summarizeTask;
    }
    onSuccess(result) {
        this.reporter.success(`Manager agent completed successfully: ${result}`);
        this.isSuccess = true;
        this.result = result;
        this.currentRun.setSuccess(result);
        this.emitRunUpdate();
    }
    onFailure(reason) {
        this.reporter.failure(`Manager agent failed: ${reason}`);
        this.isFailure = true;
        this.reason = reason;
        this.currentRun.setFailure(reason);
        this.emitRunUpdate();
    }
    async beforeAction(action) {
        this.reporter.loading(`Performing action ${action.data.name}...`);
    }
    async afterAction(action) {
        this.reporter.success(`Performing action ${action.data.name}...`);
    }
    async incrementFeedbackRetries() {
        this.feedbackRetries += 1;
    }
    async incrementRetries() {
        this.retries += 1;
    }
    async resetRetries() {
        this.retries = 0;
    }
    async incrementStepCount() {
        this.stepCount += 1;
    }
    get isCompleted() {
        return this.isSuccess || this.isFailure;
    }
    async start(startUrl, initialPrompt, jobId) {
        const vStartUrl = new VariableString(startUrl, this.variables);
        await this.browserService.launch(vStartUrl.dangerousValue());
        const vInitialPrompt = new VariableString(initialPrompt, this.variables);
        this.taskManager.setEndGoal(vInitialPrompt.publicValue());
        return this.run(jobId);
    }
    async emitRunUpdate() {
        this.eventBus?.emit('run:update', this.currentRun);
    }
    async run(jobId) {
        return new Promise(async (resolve) => {
            this.reporter.loading('Starting manager agent');
            this.currentRun = Run.InitRunning(this.taskManager.getEndGoal(), jobId);
            this.emitRunUpdate();
            while (!this.isCompleted) {
                if (this.retries >= this.maxRetries) {
                    this.onFailure('Max retries reached');
                    return resolve({
                        status: 'failed',
                        result: this.result,
                        stepCount: this.stepCount,
                        reason: 'Max number of retried reached. The agent was not able to complete the test.',
                    });
                }
                this.incrementStepCount();
                this.reporter.loading('Defining next task...');
                const task = await this.defineNextTask();
                this.currentRun.addTask(task);
                this.currentRun.executeAction();
                this.emitRunUpdate();
                this.reporter.loading(`Executing task: ${task.goal}`);
                await this.executeTask(task);
            }
            if (this.isFailure) {
                this.currentRun.setFailure(this.reason);
                this.emitRunUpdate();
                return resolve({
                    status: 'failed',
                    reason: this.reason,
                    result: this.result,
                    stepCount: this.stepCount,
                });
            }
            await this.domService.resetHighlightElements();
            this.emitRunUpdate();
            return resolve({
                status: this.isSuccess ? 'success' : 'failed',
                reason: this.reason,
                result: this.result,
                stepCount: this.stepCount,
            });
        });
    }
    async didDomStateChange() {
        const { domStateHash: currentDomStateHash } = await this.domService.getInteractiveElements(false);
        return this.lastDomStateHash !== currentDomStateHash;
    }
    ensureNoTriggerSuccessOrFailureAmongOtherActions(actions) {
        if (actions.length < 2) {
            return actions;
        }
        return actions.filter((action) => action.name !== 'triggerResult');
    }
    async defineNextTask() {
        this.currentRun.think();
        this.emitRunUpdate();
        const parser = new JsonOutputParser();
        const systemMessage = new ManagerAgentPrompt(this.maxActionsPerTask).getSystemMessage();
        const { screenshot, pristineScreenshot, stringifiedDomState, domStateHash, pixelAbove, pixelBelow, } = await this.domService.getInteractiveElements();
        this.lastDomStateHash = domStateHash;
        const humanMessage = new ManagerAgentHumanPrompt().getHumanMessage({
            memoryLearnings: this.memoryLearnings.join(' ; '),
            serializedTasks: this.taskManager.getSerializedTasks(),
            pristineScreenshotUrl: pristineScreenshot,
            screenshotUrl: screenshot,
            stringifiedDomState,
            pageUrl: this.browserService.getPageUrl(),
            pixelAbove,
            pixelBelow,
        });
        const messages = [systemMessage, humanMessage];
        try {
            const parsedResponse = await this.llmService.invokeAndParse(messages, parser);
            const safeActions = this.ensureNoTriggerSuccessOrFailureAmongOtherActions(parsedResponse.actions);
            const task = Task.InitPending(parsedResponse.currentState.nextGoal, safeActions);
            this.taskManager.add(task);
            return task;
        }
        catch (error) {
            console.error('Error parsing agent response:', error);
            return Task.InitPending('Keep trying', []);
        }
    }
    async executeTask(task) {
        task.start();
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
                this.emitRunUpdate();
                await new Promise((resolve) => setTimeout(resolve, this.msDelayBetweenActions));
                task.complete();
                this.emitRunUpdate();
                this.resetRetries();
                this.taskManager.update(task);
            }
            catch (error) {
                action.fail(`Task failed with error: ${error?.message ?? 'Unknown error'}`);
                task.fail(`Task failed with error: ${error?.message ?? 'Unknown error'}`);
                this.taskManager.update(task);
                this.incrementRetries();
                this.emitRunUpdate();
            }
        }
        this.reporter.success(task.goal);
    }
    async executeAction(action) {
        let coordinates = null;
        await this.beforeAction(action);
        this.emitRunUpdate();
        switch (action.data.name) {
            case 'clickElement':
                coordinates = this.domService.getIndexSelector(action.data.params.index);
                if (!coordinates) {
                    throw new Error('Index or coordinates not found');
                }
                await this.domService.resetHighlightElements();
                await this.domService.highlightElementPointer(coordinates);
                await this.browserService.mouseClick(coordinates.x, coordinates.y);
                await this.domService.resetHighlightElements();
                action.complete();
                break;
            case 'fillInput':
                coordinates = this.domService.getIndexSelector(action.data.params.index);
                if (!coordinates) {
                    action.fail('Index or coordinates not found');
                    throw new Error('Index or coordinates not found');
                }
                await this.domService.highlightElementPointer(coordinates);
                const variableString = new VariableString(action.data.params.text, this.variables);
                await this.browserService.fillInput(variableString, coordinates);
                await this.domService.resetHighlightElements();
                action.complete();
                break;
            case 'scrollDown':
                await this.browserService.scrollDown();
                await this.domService.resetHighlightElements();
                await this.domService.highlightElementWheel('down');
                action.complete();
                break;
            case 'scrollUp':
                await this.browserService.scrollUp();
                await this.domService.resetHighlightElements();
                await this.domService.highlightElementWheel('up');
                action.complete();
                break;
            case 'takeScreenshot':
                await this.domService.resetHighlightElements();
                await this.domService.highlightForSoM();
                action.complete();
                break;
            case 'goToUrl':
                await this.browserService.goToUrl(action.data.params.url);
                action.complete();
                break;
            case 'goBack':
                await this.browserService.goBack();
                action.complete();
                break;
            case 'extractContent':
                const content = await this.browserService.extractContent();
                this.summarizeTask.prepare({
                    images: [],
                    memory: '',
                    input: `Our goal is to ${this.taskManager.getEndGoal()} Here is the content extracted from the page: ${content}.`,
                });
                const summarized = await this.summarizer.perform(this.summarizeTask);
                this.memoryLearnings.push(`Key takeways from content on page ${this.browserService.getPageUrl()}: ${summarized.takeaways}`);
                action.complete(summarized.takeaways);
                console.log('-----this.memoryLearnings', this.memoryLearnings);
                break;
            case 'triggerResult':
                const { pristineScreenshot } = await this.domService.getDomState();
                const answer = action.data.params.data;
                const { result, explanation, hint, memoryLearning } = await this.feedbackAgent.evaluate({
                    pageUrl: this.browserService.getPageUrl(),
                    screenshotUrls: [pristineScreenshot],
                    task: this.taskManager.getEndGoal(),
                    answer,
                    taskHistorySummary: this.taskManager.getSerializedTasks(),
                    previousTaskResult: JSON.stringify(this.taskManager.getLatestTaskPerformed()?.objectForLLM()),
                });
                if (result === 'success' || result === 'unknown') {
                    action.complete(explanation);
                    this.onSuccess(answer);
                }
                else {
                    if (this.feedbackRetries > this.maxRetries) {
                        this.onFailure('Max feedback retries reached');
                    }
                    action.fail(JSON.stringify({ result, explanation, hint }));
                    this.memoryLearnings.push(memoryLearning);
                    this.incrementFeedbackRetries();
                }
                break;
        }
        await this.afterAction(action);
        this.emitRunUpdate();
    }
}
//# sourceMappingURL=openator.js.map