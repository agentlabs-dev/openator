import { BaseMessage, HumanMessage } from "@langchain/core/messages";
/**
 * Contains the chunk of messages, along with the
 * users response, which is the next message after the chunk.
 */
export type MessageChunkResult = {
    chunkedMessages: BaseMessage[];
    /**
     * User response can be undefined if the last message in
     * the chat history was from the AI.
     */
    userResponse?: HumanMessage;
};
export type PredictNextUserMessageResponse = {
    userState: string;
    predictedUserMessage: string;
    insights: Array<string>;
};
export type GetPredictionViolationsResponse = {
    userResponse?: HumanMessage;
    revisedPrediction: string;
    explainedPredictionErrors: Array<string>;
};
export declare const PREDICT_NEXT_USER_MESSAGE_FUNCTION: {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            userState: {
                type: string;
                description: string;
            };
            predictedUserMessage: {
                type: string;
                description: string;
            };
            insights: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
        };
        required: string[];
    };
};
export declare const PREDICTION_VIOLATIONS_FUNCTION: {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            violationExplanation: {
                type: string;
                description: string;
            };
            explainedPredictionErrors: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
        };
        required: string[];
    };
};
