import { BaseOutputParser } from "@langchain/core/output_parsers";
/**
 * Abstract class representing an output parser specifically for agent
 * actions and finishes in LangChain. It extends the `BaseOutputParser`
 * class.
 */
export class AgentActionOutputParser extends BaseOutputParser {
}
/**
 * Abstract class representing an output parser specifically for agents
 * that return multiple actions.
 */
export class AgentMultiActionOutputParser extends BaseOutputParser {
}
