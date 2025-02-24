import { ChatPromptValueInterface } from "../prompt_values.js";
import { RunnableLike, Runnable } from "../runnables/base.js";
import { RunnableConfig } from "../runnables/config.js";
import { InputValues } from "../utils/types/index.js";
import { BaseMessagePromptTemplateLike, ChatPromptTemplate, ChatPromptTemplateInput } from "./chat.js";
/**
 * Interface for the input of a ChatPromptTemplate.
 */
export interface StructuredPromptInput<RunInput extends InputValues = any, PartialVariableName extends string = any> extends ChatPromptTemplateInput<RunInput, PartialVariableName> {
    schema: Record<string, any>;
}
export declare class StructuredPrompt<RunInput extends InputValues = any, PartialVariableName extends string = any> extends ChatPromptTemplate<RunInput, PartialVariableName> implements StructuredPromptInput<RunInput, PartialVariableName> {
    schema: Record<string, any>;
    lc_namespace: string[];
    get lc_aliases(): Record<string, string>;
    constructor(input: StructuredPromptInput<RunInput, PartialVariableName>);
    pipe<NewRunOutput>(coerceable: RunnableLike<ChatPromptValueInterface, NewRunOutput>): Runnable<RunInput, Exclude<NewRunOutput, Error>, RunnableConfig>;
    static fromMessagesAndSchema<RunInput extends InputValues = any>(promptMessages: (ChatPromptTemplate<InputValues, string> | BaseMessagePromptTemplateLike)[], schema: StructuredPromptInput["schema"]): ChatPromptTemplate<RunInput, any>;
}
