"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanAndExecuteAgentExecutor = exports.isDynamicStructuredTool = void 0;
const base_js_1 = require("../../chains/base.cjs");
const base_js_2 = require("./base.cjs");
const executor_js_1 = require("../../agents/executor.cjs");
const prompt_js_1 = require("./prompt.cjs");
const llm_chain_js_1 = require("../../chains/llm_chain.cjs");
const outputParser_js_1 = require("./outputParser.cjs");
const index_js_1 = require("../../agents/chat/index.cjs");
const index_js_2 = require("../../agents/index.cjs");
/**
 * A utility function to distiguish a dynamicstructuredtool over other tools.
 * @param tool the tool to test
 * @returns bool
 */
function isDynamicStructuredTool(tool) {
    // We check for the existence of the static lc_name method in the object's constructor
    return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof tool.constructor.lc_name === "function" &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tool.constructor.lc_name() === "DynamicStructuredTool");
}
exports.isDynamicStructuredTool = isDynamicStructuredTool;
/**
 * Class representing a plan-and-execute agent executor. This agent
 * decides on the full sequence of actions upfront, then executes them all
 * without updating the plan. This is suitable for complex or long-running
 * tasks that require maintaining long-term objectives and focus.
 */
class PlanAndExecuteAgentExecutor extends base_js_1.BaseChain {
    static lc_name() {
        return "PlanAndExecuteAgentExecutor";
    }
    constructor(input) {
        super(input);
        Object.defineProperty(this, "planner", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stepExecutor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stepContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new base_js_2.ListStepContainer()
        });
        Object.defineProperty(this, "inputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "input"
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "output"
        });
        this.planner = input.planner;
        this.stepExecutor = input.stepExecutor;
        this.stepContainer = input.stepContainer ?? this.stepContainer;
        this.inputKey = input.inputKey ?? this.inputKey;
        this.outputKey = input.outputKey ?? this.outputKey;
    }
    get inputKeys() {
        return [this.inputKey];
    }
    get outputKeys() {
        return [this.outputKey];
    }
    /**
     * Static method that returns a default planner for the agent. It creates
     * a new LLMChain with a given LLM and a fixed prompt, and uses it to
     * create a new LLMPlanner with a PlanOutputParser.
     * @param llm The Large Language Model (LLM) used to generate responses.
     * @returns A new LLMPlanner instance.
     */
    static async getDefaultPlanner({ llm, tools, }) {
        const plannerLlmChain = new llm_chain_js_1.LLMChain({
            llm,
            prompt: await (0, prompt_js_1.getPlannerChatPrompt)(tools),
        });
        return new base_js_2.LLMPlanner(plannerLlmChain, new outputParser_js_1.PlanOutputParser());
    }
    /**
     * Static method that returns a default step executor for the agent. It
     * creates a new ChatAgent from a given LLM and a set of tools, and uses
     * it to create a new ChainStepExecutor.
     * @param llm The Large Language Model (LLM) used to generate responses.
     * @param tools The set of tools used by the agent.
     * @param humanMessageTemplate The template for human messages. If not provided, a default template is used.
     * @returns A new ChainStepExecutor instance.
     */
    static getDefaultStepExecutor({ llm, tools, humanMessageTemplate = prompt_js_1.DEFAULT_STEP_EXECUTOR_HUMAN_CHAT_MESSAGE_TEMPLATE, }) {
        let agent;
        if (tools.length > 0 && isDynamicStructuredTool(tools[0])) {
            agent = index_js_2.StructuredChatAgent.fromLLMAndTools(llm, tools, {
                humanMessageTemplate,
                inputVariables: ["previous_steps", "current_step", "agent_scratchpad"],
            });
            return new base_js_2.ChainStepExecutor(executor_js_1.AgentExecutor.fromAgentAndTools({
                agent,
                tools,
            }));
        }
        agent = index_js_1.ChatAgent.fromLLMAndTools(llm, tools, {
            humanMessageTemplate,
        });
        return new base_js_2.ChainStepExecutor(executor_js_1.AgentExecutor.fromAgentAndTools({
            agent,
            tools,
        }));
    }
    /**
     * Static method that creates a new PlanAndExecuteAgentExecutor from a
     * given LLM, a set of tools, and optionally a human message template. It
     * uses the getDefaultPlanner and getDefaultStepExecutor methods to create
     * the planner and step executor for the new agent executor.
     * @param llm The Large Language Model (LLM) used to generate responses.
     * @param tools The set of tools used by the agent.
     * @param humanMessageTemplate The template for human messages. If not provided, a default template is used.
     * @returns A new PlanAndExecuteAgentExecutor instance.
     */
    static async fromLLMAndTools({ llm, tools, humanMessageTemplate, }) {
        const executor = new PlanAndExecuteAgentExecutor({
            planner: await PlanAndExecuteAgentExecutor.getDefaultPlanner({
                llm,
                tools,
            }),
            stepExecutor: PlanAndExecuteAgentExecutor.getDefaultStepExecutor({
                llm,
                tools,
                humanMessageTemplate,
            }),
        });
        return executor;
    }
    /** @ignore */
    async _call(inputs, runManager) {
        const plan = await this.planner.plan(inputs.input, runManager?.getChild());
        if (!plan.steps?.length) {
            throw new Error("Could not create and parse a plan to answer your question - please try again.");
        }
        plan.steps[plan.steps.length - 1].text += ` The original question was: ${inputs.input}.`;
        for (const step of plan.steps) {
            const newInputs = {
                ...inputs,
                previous_steps: JSON.stringify(this.stepContainer.getSteps()),
                current_step: step.text,
            };
            const response = await this.stepExecutor.step(newInputs, runManager?.getChild());
            this.stepContainer.addStep(step, response);
        }
        return { [this.outputKey]: this.stepContainer.getFinalResponse() };
    }
    _chainType() {
        return "agent_executor";
    }
    serialize() {
        throw new Error("Cannot serialize an AgentExecutor");
    }
}
exports.PlanAndExecuteAgentExecutor = PlanAndExecuteAgentExecutor;
