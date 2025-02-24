import { BaseMessage } from '@langchain/core/messages';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import 'dotenv/config';
import { LLM } from '@/core/interfaces/llm.interface';
export declare class OpenAI4o implements LLM {
    private model;
    constructor(openAiApiKey: string);
    invokeAndParse<T extends Record<string, any>>(messages: BaseMessage[], parser: JsonOutputParser<T>): Promise<T>;
}
