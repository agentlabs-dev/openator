import { ToolInputParsingException, Tool, } from "@langchain/core/tools";
import { Runnable, patchConfig, } from "@langchain/core/runnables";
import { CallbackManager, } from "@langchain/core/callbacks/manager";
import { OutputParserException } from "@langchain/core/output_parsers";
import { Serializable } from "@langchain/core/load/serializable";
import { AgentRunnableSequence, RunnableMultiActionAgent, RunnableSingleActionAgent, isRunnableAgent, } from "./agent.js";
import { BaseChain } from "../chains/base.js";
export class AgentExecutorIterator extends Serializable {
    get finalOutputs() {
        return this._finalOutputs;
    }
    /** Intended to be used as a setter method, needs to be async. */
    async setFinalOutputs(value) {
        this._finalOutputs = undefined;
        if (value) {
            const preparedOutputs = await this.agentExecutor.prepOutputs(this.inputs, value, true);
            this._finalOutputs = preparedOutputs;
        }
    }
    get nameToToolMap() {
        const toolMap = this.agentExecutor.tools.map((tool) => ({
            [tool.name]: tool,
        }));
        return Object.assign({}, ...toolMap);
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "executor_iterator"]
        });
        Object.defineProperty(this, "agentExecutor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** @deprecated Use "config" */
        Object.defineProperty(this, "callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** @deprecated Use "config" */
        Object.defineProperty(this, "tags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** @deprecated Use "config" */
        Object.defineProperty(this, "metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** @deprecated Use "config" */
        Object.defineProperty(this, "runName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_finalOutputs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "runManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "intermediateSteps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "iterations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.agentExecutor = fields.agentExecutor;
        this.inputs = fields.inputs;
        this.callbacks = fields.callbacks;
        this.tags = fields.tags;
        this.metadata = fields.metadata;
        this.runName = fields.runName;
        this.runManager = fields.runManager;
        this.config = fields.config;
    }
    /**
     * Reset the iterator to its initial state, clearing intermediate steps,
     * iterations, and the final output.
     */
    reset() {
        this.intermediateSteps = [];
        this.iterations = 0;
        this._finalOutputs = undefined;
    }
    updateIterations() {
        this.iterations += 1;
    }
    async *streamIterator() {
        this.reset();
        // Loop to handle iteration
        while (true) {
            try {
                if (this.iterations === 0) {
                    await this.onFirstStep();
                }
                const result = await this._callNext();
                yield result;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (e) {
                if ("message" in e &&
                    e.message.startsWith("Final outputs already reached: ")) {
                    if (!this.finalOutputs) {
                        throw e;
                    }
                    return this.finalOutputs;
                }
                if (this.runManager) {
                    await this.runManager.handleChainError(e);
                }
                throw e;
            }
        }
    }
    /**
     * Perform any necessary setup for the first step
     * of the asynchronous iterator.
     */
    async onFirstStep() {
        if (this.iterations === 0) {
            const callbackManager = await CallbackManager.configure(this.callbacks ?? this.config?.callbacks, this.agentExecutor.callbacks, this.tags ?? this.config?.tags, this.agentExecutor.tags, this.metadata ?? this.config?.metadata, this.agentExecutor.metadata, {
                verbose: this.agentExecutor.verbose,
            });
            this.runManager = await callbackManager?.handleChainStart(this.agentExecutor.toJSON(), this.inputs, this.config?.runId, undefined, this.tags ?? this.config?.tags, this.metadata ?? this.config?.metadata, this.runName ?? this.config?.runName);
            if (this.config !== undefined) {
                delete this.config.runId;
            }
        }
    }
    /**
     * Execute the next step in the chain using the
     * AgentExecutor's _takeNextStep method.
     */
    async _executeNextStep(runManager) {
        return this.agentExecutor._takeNextStep(this.nameToToolMap, this.inputs, this.intermediateSteps, runManager, this.config);
    }
    /**
     * Process the output of the next step,
     * handling AgentFinish and tool return cases.
     */
    async _processNextStepOutput(nextStepOutput, runManager) {
        if ("returnValues" in nextStepOutput) {
            const output = await this.agentExecutor._return(nextStepOutput, this.intermediateSteps, runManager);
            if (this.runManager) {
                await this.runManager.handleChainEnd(output);
            }
            await this.setFinalOutputs(output);
            return output;
        }
        this.intermediateSteps = this.intermediateSteps.concat(nextStepOutput);
        let output = {};
        if (Array.isArray(nextStepOutput) && nextStepOutput.length === 1) {
            const nextStep = nextStepOutput[0];
            const toolReturn = await this.agentExecutor._getToolReturn(nextStep);
            if (toolReturn) {
                output = await this.agentExecutor._return(toolReturn, this.intermediateSteps, runManager);
                await this.runManager?.handleChainEnd(output);
                await this.setFinalOutputs(output);
            }
        }
        output = { intermediateSteps: nextStepOutput };
        return output;
    }
    async _stop() {
        const output = await this.agentExecutor.agent.returnStoppedResponse(this.agentExecutor.earlyStoppingMethod, this.intermediateSteps, this.inputs);
        const returnedOutput = await this.agentExecutor._return(output, this.intermediateSteps, this.runManager);
        await this.setFinalOutputs(returnedOutput);
        await this.runManager?.handleChainEnd(returnedOutput);
        return returnedOutput;
    }
    async _callNext() {
        // final output already reached: stopiteration (final output)
        if (this.finalOutputs) {
            throw new Error(`Final outputs already reached: ${JSON.stringify(this.finalOutputs, null, 2)}`);
        }
        // timeout/max iterations: stopiteration (stopped response)
        if (!this.agentExecutor.shouldContinueGetter(this.iterations)) {
            return this._stop();
        }
        const nextStepOutput = await this._executeNextStep(this.runManager);
        const output = await this._processNextStepOutput(nextStepOutput, this.runManager);
        this.updateIterations();
        return output;
    }
}
/**
 * Tool that just returns the query.
 * Used for exception tracking.
 */
export class ExceptionTool extends Tool {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "_Exception"
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Exception tool"
        });
    }
    async _call(query) {
        return query;
    }
}
/**
 * A chain managing an agent using tools.
 * @augments BaseChain
 * @example
 * ```typescript
 *
 * const executor = AgentExecutor.fromAgentAndTools({
 *   agent: async () => loadAgentFromLangchainHub(),
 *   tools: [new SerpAPI(), new Calculator()],
 *   returnIntermediateSteps: true,
 * });
 *
 * const result = await executor.invoke({
 *   input: `Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?`,
 * });
 *
 * ```
 */
export class AgentExecutor extends BaseChain {
    static lc_name() {
        return "AgentExecutor";
    }
    get lc_namespace() {
        return ["langchain", "agents", "executor"];
    }
    get inputKeys() {
        return this.agent.inputKeys;
    }
    get outputKeys() {
        return this.agent.returnValues;
    }
    constructor(input) {
        let agent;
        let returnOnlyOutputs = true;
        if (Runnable.isRunnable(input.agent)) {
            if (AgentRunnableSequence.isAgentRunnableSequence(input.agent)) {
                if (input.agent.singleAction) {
                    agent = new RunnableSingleActionAgent({
                        runnable: input.agent,
                        streamRunnable: input.agent.streamRunnable,
                    });
                }
                else {
                    agent = new RunnableMultiActionAgent({
                        runnable: input.agent,
                        streamRunnable: input.agent.streamRunnable,
                    });
                }
            }
            else {
                agent = new RunnableMultiActionAgent({ runnable: input.agent });
            }
            // TODO: Update BaseChain implementation on breaking change
            returnOnlyOutputs = false;
        }
        else {
            if (isRunnableAgent(input.agent)) {
                returnOnlyOutputs = false;
            }
            agent = input.agent;
        }
        super(input);
        Object.defineProperty(this, "agent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "returnIntermediateSteps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "maxIterations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 15
        });
        Object.defineProperty(this, "earlyStoppingMethod", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "force"
        });
        // TODO: Update BaseChain implementation on breaking change to include this
        Object.defineProperty(this, "returnOnlyOutputs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        /**
         * How to handle errors raised by the agent's output parser.
          Defaults to `False`, which raises the error.
      
          If `true`, the error will be sent back to the LLM as an observation.
          If a string, the string itself will be sent to the LLM as an observation.
          If a callable function, the function will be called with the exception
          as an argument, and the result of that function will be passed to the agent
          as an observation.
         */
        Object.defineProperty(this, "handleParsingErrors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "handleToolRuntimeErrors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.agent = agent;
        this.tools = input.tools;
        this.handleParsingErrors =
            input.handleParsingErrors ?? this.handleParsingErrors;
        this.handleToolRuntimeErrors = input.handleToolRuntimeErrors;
        this.returnOnlyOutputs = returnOnlyOutputs;
        if (this.agent._agentActionType() === "multi") {
            for (const tool of this.tools) {
                if (tool.returnDirect) {
                    throw new Error(`Tool with return direct ${tool.name} not supported for multi-action agent.`);
                }
            }
        }
        this.returnIntermediateSteps =
            input.returnIntermediateSteps ?? this.returnIntermediateSteps;
        this.maxIterations = input.maxIterations ?? this.maxIterations;
        this.earlyStoppingMethod =
            input.earlyStoppingMethod ?? this.earlyStoppingMethod;
    }
    /** Create from agent and a list of tools. */
    static fromAgentAndTools(fields) {
        return new AgentExecutor(fields);
    }
    get shouldContinueGetter() {
        return this.shouldContinue.bind(this);
    }
    /**
     * Method that checks if the agent execution should continue based on the
     * number of iterations.
     * @param iterations The current number of iterations.
     * @returns A boolean indicating whether the agent execution should continue.
     */
    shouldContinue(iterations) {
        return this.maxIterations === undefined || iterations < this.maxIterations;
    }
    /** @ignore */
    async _call(inputs, runManager, config) {
        const toolsByName = Object.fromEntries(this.tools.map((t) => [t.name.toLowerCase(), t]));
        const steps = [];
        let iterations = 0;
        const getOutput = async (finishStep) => {
            const { returnValues } = finishStep;
            const additional = await this.agent.prepareForOutput(returnValues, steps);
            await runManager?.handleAgentEnd(finishStep);
            let response;
            if (this.returnIntermediateSteps) {
                response = { ...returnValues, intermediateSteps: steps, ...additional };
            }
            else {
                response = { ...returnValues, ...additional };
            }
            if (!this.returnOnlyOutputs) {
                response = { ...inputs, ...response };
            }
            return response;
        };
        while (this.shouldContinue(iterations)) {
            let output;
            try {
                output = await this.agent.plan(steps, inputs, runManager?.getChild(), config);
            }
            catch (e) {
                // eslint-disable-next-line no-instanceof/no-instanceof
                if (e instanceof OutputParserException) {
                    let observation;
                    let text = e.message;
                    if (this.handleParsingErrors === true) {
                        if (e.sendToLLM) {
                            observation = e.observation;
                            text = e.llmOutput ?? "";
                        }
                        else {
                            observation = "Invalid or incomplete response";
                        }
                    }
                    else if (typeof this.handleParsingErrors === "string") {
                        observation = this.handleParsingErrors;
                    }
                    else if (typeof this.handleParsingErrors === "function") {
                        observation = this.handleParsingErrors(e);
                    }
                    else {
                        throw e;
                    }
                    output = {
                        tool: "_Exception",
                        toolInput: observation,
                        log: text,
                    };
                }
                else {
                    throw e;
                }
            }
            // Check if the agent has finished
            if ("returnValues" in output) {
                return getOutput(output);
            }
            let actions;
            if (Array.isArray(output)) {
                actions = output;
            }
            else {
                actions = [output];
            }
            const newSteps = await Promise.all(actions.map(async (action) => {
                await runManager?.handleAgentAction(action);
                const tool = action.tool === "_Exception"
                    ? new ExceptionTool()
                    : toolsByName[action.tool?.toLowerCase()];
                let observation;
                try {
                    observation = tool
                        ? await tool.invoke(action.toolInput, patchConfig(config, { callbacks: runManager?.getChild() }))
                        : `${action.tool} is not a valid tool, try another one.`;
                    if (typeof observation !== "string") {
                        throw new Error("Received unsupported non-string response from tool call.");
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }
                catch (e) {
                    // eslint-disable-next-line no-instanceof/no-instanceof
                    if (e instanceof ToolInputParsingException) {
                        if (this.handleParsingErrors === true) {
                            observation =
                                "Invalid or incomplete tool input. Please try again.";
                        }
                        else if (typeof this.handleParsingErrors === "string") {
                            observation = this.handleParsingErrors;
                        }
                        else if (typeof this.handleParsingErrors === "function") {
                            observation = this.handleParsingErrors(e);
                        }
                        else {
                            throw e;
                        }
                        observation = await new ExceptionTool().call(observation, runManager?.getChild());
                        return { action, observation: observation ?? "" };
                    }
                    else if (this.handleToolRuntimeErrors !== undefined) {
                        observation = this.handleToolRuntimeErrors(e);
                    }
                }
                return { action, observation: observation ?? "" };
            }));
            steps.push(...newSteps);
            const lastStep = steps[steps.length - 1];
            const lastTool = toolsByName[lastStep.action.tool?.toLowerCase()];
            if (lastTool?.returnDirect) {
                return getOutput({
                    returnValues: { [this.agent.returnValues[0]]: lastStep.observation },
                    log: "",
                });
            }
            iterations += 1;
        }
        const finish = await this.agent.returnStoppedResponse(this.earlyStoppingMethod, steps, inputs);
        return getOutput(finish);
    }
    async _takeNextStep(nameToolMap, inputs, intermediateSteps, runManager, config) {
        let output;
        try {
            output = await this.agent.plan(intermediateSteps, inputs, runManager?.getChild(), config);
        }
        catch (e) {
            // eslint-disable-next-line no-instanceof/no-instanceof
            if (e instanceof OutputParserException) {
                let observation;
                let text = e.message;
                if (this.handleParsingErrors === true) {
                    if (e.sendToLLM) {
                        observation = e.observation;
                        text = e.llmOutput ?? "";
                    }
                    else {
                        observation = "Invalid or incomplete response";
                    }
                }
                else if (typeof this.handleParsingErrors === "string") {
                    observation = this.handleParsingErrors;
                }
                else if (typeof this.handleParsingErrors === "function") {
                    observation = this.handleParsingErrors(e);
                }
                else {
                    throw e;
                }
                output = {
                    tool: "_Exception",
                    toolInput: observation,
                    log: text,
                };
            }
            else {
                throw e;
            }
        }
        if ("returnValues" in output) {
            return output;
        }
        let actions;
        if (Array.isArray(output)) {
            actions = output;
        }
        else {
            actions = [output];
        }
        const result = [];
        for (const agentAction of actions) {
            let observation = "";
            if (runManager) {
                await runManager?.handleAgentAction(agentAction);
            }
            if (agentAction.tool in nameToolMap) {
                const tool = nameToolMap[agentAction.tool];
                try {
                    observation = await tool.call(agentAction.toolInput, runManager?.getChild());
                    if (typeof observation !== "string") {
                        throw new Error("Received unsupported non-string response from tool call.");
                    }
                }
                catch (e) {
                    // eslint-disable-next-line no-instanceof/no-instanceof
                    if (e instanceof ToolInputParsingException) {
                        if (this.handleParsingErrors === true) {
                            observation =
                                "Invalid or incomplete tool input. Please try again.";
                        }
                        else if (typeof this.handleParsingErrors === "string") {
                            observation = this.handleParsingErrors;
                        }
                        else if (typeof this.handleParsingErrors === "function") {
                            observation = this.handleParsingErrors(e);
                        }
                        else {
                            throw e;
                        }
                        observation = await new ExceptionTool().call(observation, runManager?.getChild());
                    }
                }
            }
            else {
                observation = `${agentAction.tool} is not a valid tool, try another available tool: ${Object.keys(nameToolMap).join(", ")}`;
            }
            result.push({
                action: agentAction,
                observation,
            });
        }
        return result;
    }
    async _return(output, intermediateSteps, runManager) {
        if (runManager) {
            await runManager.handleAgentEnd(output);
        }
        const finalOutput = output.returnValues;
        if (this.returnIntermediateSteps) {
            finalOutput.intermediateSteps = intermediateSteps;
        }
        return finalOutput;
    }
    async _getToolReturn(nextStepOutput) {
        const { action, observation } = nextStepOutput;
        const nameToolMap = Object.fromEntries(this.tools.map((t) => [t.name.toLowerCase(), t]));
        const [returnValueKey = "output"] = this.agent.returnValues;
        // Invalid tools won't be in the map, so we return False.
        if (action.tool in nameToolMap) {
            if (nameToolMap[action.tool].returnDirect) {
                return {
                    returnValues: { [returnValueKey]: observation },
                    log: "",
                };
            }
        }
        return null;
    }
    _returnStoppedResponse(earlyStoppingMethod) {
        if (earlyStoppingMethod === "force") {
            return {
                returnValues: {
                    output: "Agent stopped due to iteration limit or time limit.",
                },
                log: "",
            };
        }
        throw new Error(`Got unsupported early_stopping_method: ${earlyStoppingMethod}`);
    }
    async *_streamIterator(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputs, options) {
        const agentExecutorIterator = new AgentExecutorIterator({
            inputs,
            agentExecutor: this,
            config: options,
            // TODO: Deprecate these other parameters
            metadata: options?.metadata,
            tags: options?.tags,
            callbacks: options?.callbacks,
        });
        const iterator = agentExecutorIterator.streamIterator();
        for await (const step of iterator) {
            if (!step) {
                continue;
            }
            yield step;
        }
    }
    _chainType() {
        return "agent_executor";
    }
    serialize() {
        throw new Error("Cannot serialize an AgentExecutor");
    }
}
