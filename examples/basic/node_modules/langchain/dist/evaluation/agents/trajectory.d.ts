import type { StructuredToolInterface } from "@langchain/core/tools";
import { BaseLLMOutputParser } from "@langchain/core/output_parsers";
import { AgentStep } from "@langchain/core/agents";
import { ChainValues } from "@langchain/core/utils/types";
import { ChatGeneration, Generation } from "@langchain/core/outputs";
import { BasePromptTemplate } from "@langchain/core/prompts";
import { Callbacks, BaseCallbackConfig } from "@langchain/core/callbacks/manager";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AgentTrajectoryEvaluator, EvalOutputType, LLMEvalChainInput, LLMTrajectoryEvaluatorArgs, type ExtractLLMCallOptions } from "../base.js";
/**
 * A parser for the output of the TrajectoryEvalChain.
 */
export declare class TrajectoryOutputParser extends BaseLLMOutputParser<EvalOutputType> {
    static lc_name(): string;
    lc_namespace: string[];
    parseResult(generations: Generation[] | ChatGeneration[], _callbacks: Callbacks | undefined): Promise<EvalOutputType>;
}
/**
 * A chain for evaluating ReAct style agents.
 *
 * This chain is used to evaluate ReAct style agents by reasoning about
 * the sequence of actions taken and their outcomes.
 */
export declare class TrajectoryEvalChain extends AgentTrajectoryEvaluator {
    static lc_name(): string;
    criterionName?: string;
    evaluationName?: string;
    requiresInput: boolean;
    requiresReference: boolean;
    outputParser: TrajectoryOutputParser;
    static resolveTrajectoryPrompt(prompt?: BasePromptTemplate | undefined, agentTools?: StructuredToolInterface[]): BasePromptTemplate<any, import("@langchain/core/prompt_values").BasePromptValueInterface, any>;
    /**
     * Get the description of the agent tools.
     *
     * @returns The description of the agent tools.
     */
    static toolsDescription(agentTools: StructuredToolInterface[]): string;
    /**
     * Create a new TrajectoryEvalChain.
     * @param llm
     * @param agentTools - The tools used by the agent.
     * @param chainOptions - The options for the chain.
     */
    static fromLLM(llm: BaseChatModel, agentTools?: StructuredToolInterface[], chainOptions?: Partial<Omit<LLMEvalChainInput, "llm">>): Promise<TrajectoryEvalChain>;
    _prepareOutput(result: ChainValues): any;
    /**
     * Get the agent trajectory as a formatted string.
     *
     * @param steps - The agent trajectory.
     * @returns The formatted agent trajectory.
     */
    getAgentTrajectory(steps: AgentStep[]): string;
    formatReference(reference?: string): string;
    _evaluateAgentTrajectory(args: LLMTrajectoryEvaluatorArgs, callOptions: ExtractLLMCallOptions<this["llm"]>, config?: Callbacks | BaseCallbackConfig): Promise<ChainValues>;
}
