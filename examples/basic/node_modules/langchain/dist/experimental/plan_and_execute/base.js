/**
 * Abstract class that defines the structure for a planner. Planners are
 * responsible for generating a plan based on inputs.
 */
export class BasePlanner {
}
/**
 * Abstract class that defines the structure for a step executor. Step
 * executors are responsible for executing a step based on inputs.
 */
export class BaseStepExecutor {
}
/**
 * Abstract class that defines the structure for a step container. Step
 * containers are responsible for managing steps.
 */
export class BaseStepContainer {
}
/**
 * Class that extends BaseStepContainer and provides an implementation for
 * its methods. It maintains a list of steps and provides methods to add a
 * step, get all steps, and get the final response.
 */
export class ListStepContainer extends BaseStepContainer {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "steps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    addStep(action, result) {
        this.steps.push({ action, result });
    }
    getSteps() {
        return this.steps;
    }
    getFinalResponse() {
        return this.steps[this.steps.length - 1]?.result?.response;
    }
}
/**
 * Class that extends BasePlanner and provides an implementation for the
 * plan method. It uses an instance of LLMChain and an output parser to
 * generate a plan.
 */
export class LLMPlanner extends BasePlanner {
    constructor(llmChain, outputParser) {
        super();
        Object.defineProperty(this, "llmChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: llmChain
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: outputParser
        });
    }
    async plan(inputs, runManager) {
        const output = await this.llmChain.run(inputs, runManager);
        return this.outputParser.parse(output);
    }
}
/**
 * Class that extends BaseStepExecutor and provides an implementation for
 * the step method. It uses an instance of BaseChain to execute a step.
 */
export class ChainStepExecutor extends BaseStepExecutor {
    constructor(chain) {
        super();
        Object.defineProperty(this, "chain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: chain
        });
    }
    async step(inputs, runManager) {
        const chainResponse = await this.chain.call(inputs, runManager);
        return { response: chainResponse.output };
    }
}
