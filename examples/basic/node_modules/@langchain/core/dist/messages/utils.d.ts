import { AIMessage, AIMessageChunk } from "./ai.js";
import { BaseMessageLike, BaseMessage, StoredMessage } from "./base.js";
import { ChatMessage, ChatMessageChunk } from "./chat.js";
import { FunctionMessage, FunctionMessageChunk } from "./function.js";
import { HumanMessage, HumanMessageChunk } from "./human.js";
import { SystemMessage, SystemMessageChunk } from "./system.js";
import { ToolMessage } from "./tool.js";
export declare function coerceMessageLikeToMessage(messageLike: BaseMessageLike): BaseMessage;
/**
 * This function is used by memory classes to get a string representation
 * of the chat message history, based on the message content and role.
 */
export declare function getBufferString(messages: BaseMessage[], humanPrefix?: string, aiPrefix?: string): string;
export declare function mapStoredMessageToChatMessage(message: StoredMessage): ToolMessage | AIMessage | ChatMessage | FunctionMessage | HumanMessage | SystemMessage;
/**
 * Transforms an array of `StoredMessage` instances into an array of
 * `BaseMessage` instances. It uses the `mapV1MessageToStoredMessage`
 * function to ensure all messages are in the `StoredMessage` format, then
 * creates new instances of the appropriate `BaseMessage` subclass based
 * on the type of each message. This function is used to prepare stored
 * messages for use in a chat context.
 */
export declare function mapStoredMessagesToChatMessages(messages: StoredMessage[]): BaseMessage[];
/**
 * Transforms an array of `BaseMessage` instances into an array of
 * `StoredMessage` instances. It does this by calling the `toDict` method
 * on each `BaseMessage`, which returns a `StoredMessage`. This function
 * is used to prepare chat messages for storage.
 */
export declare function mapChatMessagesToStoredMessages(messages: BaseMessage[]): StoredMessage[];
export declare function convertToChunk(message: BaseMessage): AIMessageChunk | ChatMessageChunk | FunctionMessageChunk | HumanMessageChunk | SystemMessageChunk;
