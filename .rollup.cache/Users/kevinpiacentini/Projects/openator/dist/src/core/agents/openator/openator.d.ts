import { TaskManagerService } from '@/core/services/task-manager-service';
import { DomService } from '@/infra/services/dom-service';
import { Browser } from '@/core/interfaces/browser.interface';
import { LLM } from '@/core/interfaces/llm.interface';
import { OpenatorResult } from '@/core/entities/test-result';
import { AgentReporter } from '@/core/interfaces/agent-reporter.interface';
import { Variable } from '@/core/entities/variable';
import { EventBusInterface } from '@/core/interfaces/event-bus.interface';
import { FeedbackAgent } from '../feedback-agent/feedback-agent';
import { AgentTask } from '../agent-base';
import { SummarizeAgent } from '../summarize-agent/summarize-agent';
export type OpenatorConfig = {
    maxActionsPerTask?: number;
    maxRetries?: number;
    variables: Variable[];
    taskManager: TaskManagerService;
    domService: DomService;
    feedbackAgent: FeedbackAgent;
    browserService: Browser;
    llmService: LLM;
    reporter: AgentReporter;
    eventBus?: EventBusInterface;
    summarizer: SummarizeAgent;
    summarizeTask: AgentTask;
};
export declare class Openator {
    private msDelayBetweenActions;
    private lastDomStateHash;
    private isSuccess;
    private isFailure;
    private reason;
    private result;
    private retries;
    private stepCount;
    private feedbackRetries;
    private readonly variables;
    private currentRun;
    private summarizer;
    private summarizeTask;
    private readonly maxActionsPerTask;
    private readonly maxRetries;
    private readonly taskManager;
    private readonly domService;
    private readonly browserService;
    private readonly llmService;
    private readonly reporter;
    private readonly eventBus;
    private readonly feedbackAgent;
    readonly memoryLearnings: string[];
    constructor(config: OpenatorConfig);
    private onSuccess;
    private onFailure;
    private beforeAction;
    private afterAction;
    private incrementFeedbackRetries;
    private incrementRetries;
    private resetRetries;
    private incrementStepCount;
    get isCompleted(): boolean;
    start(startUrl: string, initialPrompt: string, jobId?: string): Promise<OpenatorResult>;
    private emitRunUpdate;
    private run;
    private didDomStateChange;
    private ensureNoTriggerSuccessOrFailureAmongOtherActions;
    private defineNextTask;
    private executeTask;
    private executeAction;
}
