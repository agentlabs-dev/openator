"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentMultiActionOutputParser = exports.AgentActionOutputParser = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
/**
 * Abstract class representing an output parser specifically for agent
 * actions and finishes in LangChain. It extends the `BaseOutputParser`
 * class.
 */
class AgentActionOutputParser extends output_parsers_1.BaseOutputParser {
}
exports.AgentActionOutputParser = AgentActionOutputParser;
/**
 * Abstract class representing an output parser specifically for agents
 * that return multiple actions.
 */
class AgentMultiActionOutputParser extends output_parsers_1.BaseOutputParser {
}
exports.AgentMultiActionOutputParser = AgentMultiActionOutputParser;
