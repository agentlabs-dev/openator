"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = exports.LLMSingleActionAgent = exports.RunnableAgent = exports.RunnableMultiActionAgent = exports.RunnableSingleActionAgent = exports.AgentRunnableSequence = exports.isRunnableAgent = exports.BaseMultiActionAgent = exports.BaseSingleActionAgent = exports.BaseAgent = void 0;
const serializable_1 = require("@langchain/core/load/serializable");
const runnables_1 = require("@langchain/core/runnables");
/**
 * Error class for parse errors in LangChain. Contains information about
 * the error message and the output that caused the error.
 */
class ParseError extends Error {
    constructor(msg, output) {
        super(msg);
        Object.defineProperty(this, "output", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.output = output;
    }
}
/**
 * Abstract base class for agents in LangChain. Provides common
 * functionality for agents, such as handling inputs and outputs.
 */
class BaseAgent extends serializable_1.Serializable {
    get returnValues() {
        return ["output"];
    }
    get allowedTools() {
        return undefined;
    }
    /**
     * Return the string type key uniquely identifying this class of agent.
     */
    _agentType() {
        throw new Error("Not implemented");
    }
    /**
     * Return response when agent has been stopped due to max iterations
     */
    returnStoppedResponse(earlyStoppingMethod, _steps, _inputs, _callbackManager) {
        if (earlyStoppingMethod === "force") {
            return Promise.resolve({
                returnValues: { output: "Agent stopped due to max iterations." },
                log: "",
            });
        }
        throw new Error(`Invalid stopping method: ${earlyStoppingMethod}`);
    }
    /**
     * Prepare the agent for output, if needed
     */
    async prepareForOutput(_returnValues, _steps) {
        return {};
    }
}
exports.BaseAgent = BaseAgent;
/**
 * Abstract base class for single action agents in LangChain. Extends the
 * BaseAgent class and provides additional functionality specific to
 * single action agents.
 */
class BaseSingleActionAgent extends BaseAgent {
    _agentActionType() {
        return "single";
    }
}
exports.BaseSingleActionAgent = BaseSingleActionAgent;
/**
 * Abstract base class for multi-action agents in LangChain. Extends the
 * BaseAgent class and provides additional functionality specific to
 * multi-action agents.
 */
class BaseMultiActionAgent extends BaseAgent {
    _agentActionType() {
        return "multi";
    }
}
exports.BaseMultiActionAgent = BaseMultiActionAgent;
function isAgentAction(input) {
    return !Array.isArray(input) && input?.tool !== undefined;
}
function isRunnableAgent(x) {
    return (x.runnable !==
        undefined);
}
exports.isRunnableAgent = isRunnableAgent;
// TODO: Remove in the future. Only for backwards compatibility.
// Allows for the creation of runnables with properties that will
// be passed to the agent executor constructor.
class AgentRunnableSequence extends runnables_1.RunnableSequence {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "streamRunnable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "singleAction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromRunnables([first, ...runnables], config) {
        const sequence = runnables_1.RunnableSequence.from([first, ...runnables], config.name);
        sequence.singleAction = config.singleAction;
        sequence.streamRunnable = config.streamRunnable;
        return sequence;
    }
    static isAgentRunnableSequence(x) {
        return typeof x.singleAction === "boolean";
    }
}
exports.AgentRunnableSequence = AgentRunnableSequence;
/**
 * Class representing a single-action agent powered by runnables.
 * Extends the BaseSingleActionAgent class and provides methods for
 * planning agent actions with runnables.
 */
class RunnableSingleActionAgent extends BaseSingleActionAgent {
    get inputKeys() {
        return [];
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "runnable"]
        });
        Object.defineProperty(this, "runnable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Whether to stream from the runnable or not.
         * If true, the underlying LLM is invoked in a streaming fashion to make it
         * possible to get access to the individual LLM tokens when using
         * `streamLog` with the Agent Executor. If false then LLM is invoked in a
         * non-streaming fashion and individual LLM tokens will not be available
         * in `streamLog`.
         *
         * Note that the runnable should still only stream a single action or
         * finish chunk.
         */
        Object.defineProperty(this, "streamRunnable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "defaultRunName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "RunnableAgent"
        });
        this.runnable = fields.runnable;
        this.defaultRunName =
            fields.defaultRunName ?? this.runnable.name ?? this.defaultRunName;
        this.streamRunnable = fields.streamRunnable ?? this.streamRunnable;
    }
    async plan(steps, inputs, callbackManager, config) {
        const combinedInput = { ...inputs, steps };
        const combinedConfig = (0, runnables_1.patchConfig)(config, {
            callbacks: callbackManager,
            runName: this.defaultRunName,
        });
        if (this.streamRunnable) {
            const stream = await this.runnable.stream(combinedInput, combinedConfig);
            let finalOutput;
            for await (const chunk of stream) {
                if (finalOutput === undefined) {
                    finalOutput = chunk;
                }
                else {
                    throw new Error([
                        `Multiple agent actions/finishes received in streamed agent output.`,
                        `Set "streamRunnable: false" when initializing the agent to invoke this agent in non-streaming mode.`,
                    ].join("\n"));
                }
            }
            if (finalOutput === undefined) {
                throw new Error([
                    "No streaming output received from underlying runnable.",
                    `Set "streamRunnable: false" when initializing the agent to invoke this agent in non-streaming mode.`,
                ].join("\n"));
            }
            return finalOutput;
        }
        else {
            return this.runnable.invoke(combinedInput, combinedConfig);
        }
    }
}
exports.RunnableSingleActionAgent = RunnableSingleActionAgent;
/**
 * Class representing a multi-action agent powered by runnables.
 * Extends the BaseMultiActionAgent class and provides methods for
 * planning agent actions with runnables.
 */
class RunnableMultiActionAgent extends BaseMultiActionAgent {
    get inputKeys() {
        return [];
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "runnable"]
        });
        // TODO: Rename input to "intermediate_steps"
        Object.defineProperty(this, "runnable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "defaultRunName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "RunnableAgent"
        });
        Object.defineProperty(this, "stop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streamRunnable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.runnable = fields.runnable;
        this.stop = fields.stop;
        this.defaultRunName =
            fields.defaultRunName ?? this.runnable.name ?? this.defaultRunName;
        this.streamRunnable = fields.streamRunnable ?? this.streamRunnable;
    }
    async plan(steps, inputs, callbackManager, config) {
        const combinedInput = { ...inputs, steps };
        const combinedConfig = (0, runnables_1.patchConfig)(config, {
            callbacks: callbackManager,
            runName: this.defaultRunName,
        });
        let output;
        if (this.streamRunnable) {
            const stream = await this.runnable.stream(combinedInput, combinedConfig);
            let finalOutput;
            for await (const chunk of stream) {
                if (finalOutput === undefined) {
                    finalOutput = chunk;
                }
                else {
                    throw new Error([
                        `Multiple agent actions/finishes received in streamed agent output.`,
                        `Set "streamRunnable: false" when initializing the agent to invoke this agent in non-streaming mode.`,
                    ].join("\n"));
                }
            }
            if (finalOutput === undefined) {
                throw new Error([
                    "No streaming output received from underlying runnable.",
                    `Set "streamRunnable: false" when initializing the agent to invoke this agent in non-streaming mode.`,
                ].join("\n"));
            }
            output = finalOutput;
        }
        else {
            output = await this.runnable.invoke(combinedInput, combinedConfig);
        }
        if (isAgentAction(output)) {
            return [output];
        }
        return output;
    }
}
exports.RunnableMultiActionAgent = RunnableMultiActionAgent;
/** @deprecated Renamed to RunnableMultiActionAgent. */
class RunnableAgent extends RunnableMultiActionAgent {
}
exports.RunnableAgent = RunnableAgent;
/**
 * Class representing a single action agent using a LLMChain in LangChain.
 * Extends the BaseSingleActionAgent class and provides methods for
 * planning agent actions based on LLMChain outputs.
 * @example
 * ```typescript
 * const customPromptTemplate = new CustomPromptTemplate({
 *   tools: [new Calculator()],
 *   inputVariables: ["input", "agent_scratchpad"],
 * });
 * const customOutputParser = new CustomOutputParser();
 * const agent = new LLMSingleActionAgent({
 *   llmChain: new LLMChain({
 *     prompt: customPromptTemplate,
 *     llm: new ChatOpenAI({ temperature: 0 }),
 *   }),
 *   outputParser: customOutputParser,
 *   stop: ["\nObservation"],
 * });
 * const executor = new AgentExecutor({
 *   agent,
 *   tools: [new Calculator()],
 * });
 * const result = await executor.invoke({
 *   input:
 *     "Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?",
 * });
 * ```
 */
class LLMSingleActionAgent extends BaseSingleActionAgent {
    constructor(input) {
        super(input);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents"]
        });
        Object.defineProperty(this, "llmChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.stop = input.stop;
        this.llmChain = input.llmChain;
        this.outputParser = input.outputParser;
    }
    get inputKeys() {
        return this.llmChain.inputKeys;
    }
    /**
     * Decide what to do given some input.
     *
     * @param steps - Steps the LLM has taken so far, along with observations from each.
     * @param inputs - User inputs.
     * @param callbackManager - Callback manager.
     *
     * @returns Action specifying what tool to use.
     */
    async plan(steps, inputs, callbackManager) {
        const output = await this.llmChain.call({
            intermediate_steps: steps,
            stop: this.stop,
            ...inputs,
        }, callbackManager);
        return this.outputParser.parse(output[this.llmChain.outputKey], callbackManager);
    }
}
exports.LLMSingleActionAgent = LLMSingleActionAgent;
/**
 * Class responsible for calling a language model and deciding an action.
 *
 * @remarks This is driven by an LLMChain. The prompt in the LLMChain *must*
 * include a variable called "agent_scratchpad" where the agent can put its
 * intermediary work.
 *
 * @deprecated Use {@link https://js.langchain.com/docs/modules/agents/agent_types/ | new agent creation methods}.
 */
class Agent extends BaseSingleActionAgent {
    get allowedTools() {
        return this._allowedTools;
    }
    get inputKeys() {
        return this.llmChain.inputKeys.filter((k) => k !== "agent_scratchpad");
    }
    constructor(input) {
        super(input);
        Object.defineProperty(this, "llmChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_allowedTools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: undefined
        });
        this.llmChain = input.llmChain;
        this._allowedTools = input.allowedTools;
        this.outputParser = input.outputParser;
    }
    /**
     * Get the default output parser for this agent.
     */
    static getDefaultOutputParser(_fields) {
        throw new Error("Not implemented");
    }
    /**
     * Create a prompt for this class
     *
     * @param _tools - List of tools the agent will have access to, used to format the prompt.
     * @param _fields - Additional fields used to format the prompt.
     *
     * @returns A PromptTemplate assembled from the given tools and fields.
     * */
    static createPrompt(_tools, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _fields) {
        throw new Error("Not implemented");
    }
    /** Construct an agent from an LLM and a list of tools */
    static fromLLMAndTools(_llm, _tools, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _args) {
        throw new Error("Not implemented");
    }
    /**
     * Validate that appropriate tools are passed in
     */
    static validateTools(_tools) { }
    _stop() {
        return [`\n${this.observationPrefix()}`];
    }
    /**
     * Name of tool to use to terminate the chain.
     */
    finishToolName() {
        return "Final Answer";
    }
    /**
     * Construct a scratchpad to let the agent continue its thought process
     */
    async constructScratchPad(steps) {
        return steps.reduce((thoughts, { action, observation }) => thoughts +
            [
                action.log,
                `${this.observationPrefix()}${observation}`,
                this.llmPrefix(),
            ].join("\n"), "");
    }
    async _plan(steps, inputs, suffix, callbackManager) {
        const thoughts = await this.constructScratchPad(steps);
        const newInputs = {
            ...inputs,
            agent_scratchpad: suffix ? `${thoughts}${suffix}` : thoughts,
        };
        if (this._stop().length !== 0) {
            newInputs.stop = this._stop();
        }
        const output = await this.llmChain.predict(newInputs, callbackManager);
        if (!this.outputParser) {
            throw new Error("Output parser not set");
        }
        return this.outputParser.parse(output, callbackManager);
    }
    /**
     * Decide what to do given some input.
     *
     * @param steps - Steps the LLM has taken so far, along with observations from each.
     * @param inputs - User inputs.
     * @param callbackManager - Callback manager to use for this call.
     *
     * @returns Action specifying what tool to use.
     */
    plan(steps, inputs, callbackManager) {
        return this._plan(steps, inputs, undefined, callbackManager);
    }
    /**
     * Return response when agent has been stopped due to max iterations
     */
    async returnStoppedResponse(earlyStoppingMethod, steps, inputs, callbackManager) {
        if (earlyStoppingMethod === "force") {
            return {
                returnValues: { output: "Agent stopped due to max iterations." },
                log: "",
            };
        }
        if (earlyStoppingMethod === "generate") {
            try {
                const action = await this._plan(steps, inputs, "\n\nI now need to return a final answer based on the previous steps:", callbackManager);
                if ("returnValues" in action) {
                    return action;
                }
                return { returnValues: { output: action.log }, log: action.log };
            }
            catch (err) {
                // fine to use instanceof because we're in the same module
                // eslint-disable-next-line no-instanceof/no-instanceof
                if (!(err instanceof ParseError)) {
                    throw err;
                }
                return { returnValues: { output: err.output }, log: err.output };
            }
        }
        throw new Error(`Invalid stopping method: ${earlyStoppingMethod}`);
    }
    /**
     * Load an agent from a json-like object describing it.
     */
    static async deserialize(data) {
        switch (data._type) {
            case "zero-shot-react-description": {
                const { ZeroShotAgent } = await import("./mrkl/index.js");
                return ZeroShotAgent.deserialize(data);
            }
            default:
                throw new Error("Unknown agent type");
        }
    }
}
exports.Agent = Agent;
