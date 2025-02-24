"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPrioritizationChain = void 0;
const prompts_1 = require("@langchain/core/prompts");
const llm_chain_js_1 = require("../../chains/llm_chain.cjs");
/** Chain to prioritize tasks. */
class TaskPrioritizationChain extends llm_chain_js_1.LLMChain {
    static lc_name() {
        return "TaskPrioritizationChain";
    }
    /**
     * Static method to create a new TaskPrioritizationChain from a
     * BaseLanguageModel. It generates a prompt using the PromptTemplate class
     * and the task prioritization template, and returns a new instance of
     * TaskPrioritizationChain.
     * @param fields Object with fields used to initialize the chain, excluding the prompt.
     * @returns A new instance of TaskPrioritizationChain.
     */
    static fromLLM(fields) {
        const taskPrioritizationTemplate = `You are a task prioritization AI tasked with cleaning the formatting of ` +
            `and reprioritizing the following tasks: {task_names}.` +
            ` Consider the ultimate objective of your team: {objective}.` +
            ` Do not remove any tasks. Return the result as a numbered list, like:` +
            ` #. First task` +
            ` #. Second task` +
            ` Start the task list with number {next_task_id}.`;
        const prompt = new prompts_1.PromptTemplate({
            template: taskPrioritizationTemplate,
            inputVariables: ["task_names", "next_task_id", "objective"],
        });
        return new TaskPrioritizationChain({ prompt, ...fields });
    }
}
exports.TaskPrioritizationChain = TaskPrioritizationChain;
