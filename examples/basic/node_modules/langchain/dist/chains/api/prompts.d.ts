import { PromptTemplate } from "@langchain/core/prompts";
export declare const API_URL_RAW_PROMPT_TEMPLATE = "You are given the below API Documentation:\n{api_docs}\nUsing this documentation, generate the full API url to call for answering the user question.\nYou should build the API url in order to get a response that is as short as possible, while still getting the necessary information to answer the question. Pay attention to deliberately exclude any unnecessary pieces of data in the API call.\n\nQuestion:{question}\nAPI url:";
export declare const API_URL_PROMPT_TEMPLATE: PromptTemplate<{
    question: any;
    api_docs: any;
}, any>;
export declare const API_RESPONSE_RAW_PROMPT_TEMPLATE: string;
export declare const API_RESPONSE_PROMPT_TEMPLATE: PromptTemplate<{
    question: any;
    api_docs: any;
    api_url: any;
    api_response: any;
}, any>;
