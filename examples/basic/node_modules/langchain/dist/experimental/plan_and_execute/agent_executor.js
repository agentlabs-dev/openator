import { BaseChain } from "../../chains/base.js";
import { ListStepContainer, LLMPlanner, ChainStepExecutor, } from "./base.js";
import { AgentExecutor } from "../../agents/executor.js";
import { DEFAULT_STEP_EXECUTOR_HUMAN_CHAT_MESSAGE_TEMPLATE, getPlannerChatPrompt, } from "./prompt.js";
import { LLMChain } from "../../chains/llm_chain.js";
import { PlanOutputParser } from "./outputParser.js";
import { ChatAgent } from "../../agents/chat/index.js";
import { StructuredChatAgent } from "../../agents/index.js";
/**
 * A utility function to distiguish a dynamicstructuredtool over other tools.
 * @param tool the tool to test
 * @returns bool
 */
export function isDynamicStructuredTool(tool) {
    // We check for the existence of the static lc_name method in the object's constructor
    return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof tool.constructor.lc_name === "function" &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tool.constructor.lc_name() === "DynamicStructuredTool");
}
/**
 * Class representing a plan-and-execute agent executor. This agent
 * decides on the full sequence of actions upfront, then executes them all
 * without updating the plan. This is suitable for complex or long-running
 * tasks that require maintaining long-term objectives and focus.
 */
export class PlanAndExecuteAgentExecutor extends BaseChain {
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
            value: new ListStepContainer()
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
        const plannerLlmChain = new LLMChain({
            llm,
            prompt: await getPlannerChatPrompt(tools),
        });
        return new LLMPlanner(plannerLlmChain, new PlanOutputParser());
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
    static getDefaultStepExecutor({ llm, tools, humanMessageTemplate = DEFAULT_STEP_EXECUTOR_HUMAN_CHAT_MESSAGE_TEMPLATE, }) {
        let agent;
        if (tools.length > 0 && isDynamicStructuredTool(tools[0])) {
            agent = StructuredChatAgent.fromLLMAndTools(llm, tools, {
                humanMessageTemplate,
                inputVariables: ["previous_steps", "current_step", "agent_scratchpad"],
            });
            return new ChainStepExecutor(AgentExecutor.fromAgentAndTools({
                agent,
                tools,
            }));
        }
        agent = ChatAgent.fromLLMAndTools(llm, tools, {
            humanMessageTemplate,
        });
        return new ChainStepExecutor(AgentExecutor.fromAgentAndTools({
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
