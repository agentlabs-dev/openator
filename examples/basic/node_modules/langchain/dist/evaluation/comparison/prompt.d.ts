/**
 * Prompts for comparing the outputs of two models for a given question.
 *
 * This prompt is used to compare two responses and evaluate which one best follows the instructions
 * and answers the question. The prompt is based on the paper from
 * Zheng, et. al. https://arxiv.org/abs/2306.05685
 */
import { PromptTemplate } from "@langchain/core/prompts";
export declare const PROMPT: PromptTemplate<{
    input: any;
    prediction: any;
    criteria: any;
    predictionB: any;
}, any>;
export declare const PROMPT_WITH_REFERENCES: PromptTemplate<{
    input: any;
    prediction: any;
    criteria: any;
    reference: any;
    predictionB: any;
}, any>;
