import { AIMessage, ToolMessage } from "@langchain/core/messages";
/**
 * Convert agent action and observation into a function message.
 * @param agentAction - The tool invocation request from the agent
 * @param observation - The result of the tool invocation
 * @returns FunctionMessage that corresponds to the original tool invocation
 */
export function _createToolMessage(step) {
    return new ToolMessage({
        tool_call_id: step.action.toolCallId,
        content: step.observation,
        additional_kwargs: { name: step.action.tool },
    });
}
export function formatToToolMessages(steps) {
    return steps.flatMap(({ action, observation }) => {
        if ("messageLog" in action && action.messageLog !== undefined) {
            const log = action.messageLog;
            return log.concat(_createToolMessage({ action, observation }));
        }
        else {
            return [new AIMessage(action.log)];
        }
    });
}
