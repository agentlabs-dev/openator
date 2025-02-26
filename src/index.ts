/**
 * Export the main factory function
 */
export { initOpenator, InitOpenatorConfig } from './init-openator';

/**
 * Export interfaces and types
 */
export { LLM } from './core/interfaces/llm.interface';
export { Reporter } from './core/interfaces/reporter.interface';
export {
  OpenatorResult,
  OpenatorResultStatus,
  OpenatorResultStatuses,
} from './core/entities/openator-result';

export {
  ManagerAgentAction,
  ManagerAgentResponseSchema,
  ManagerResponse,
  ManagerResponseExamples,
} from './core/agents/openator/openator.types';

/**
 * Export entities and classes
 */
export { Variable } from './core/entities/variable';
export { Openator, OpenatorConfig } from './core/agents/openator/openator';
export { Task } from './core/entities/task';
export { Run } from './core/entities/run';

/**
 * Export Chat Models
 */
export { ChatOpenAI, ChatOpenAIConfig } from './models/chat-openai';
export { ChatOllama, ChatOllamaConfig } from './models/chat-ollama';
export { ChatGoogleGenAI, ChatGoogleGenAIConfig } from './models/chat-google';
