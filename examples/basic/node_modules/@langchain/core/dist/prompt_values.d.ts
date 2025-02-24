import { Serializable } from "./load/serializable.js";
import { type BaseMessage } from "./messages/base.js";
import { HumanMessage } from "./messages/human.js";
export interface BasePromptValueInterface extends Serializable {
    toString(): string;
    toChatMessages(): BaseMessage[];
}
export interface StringPromptValueInterface extends BasePromptValueInterface {
    value: string;
}
export interface ChatPromptValueInterface extends BasePromptValueInterface {
    messages: BaseMessage[];
}
/**
 * Base PromptValue class. All prompt values should extend this class.
 */
export declare abstract class BasePromptValue extends Serializable implements BasePromptValueInterface {
    abstract toString(): string;
    abstract toChatMessages(): BaseMessage[];
}
/**
 * Represents a prompt value as a string. It extends the BasePromptValue
 * class and overrides the toString and toChatMessages methods.
 */
export declare class StringPromptValue extends BasePromptValue implements StringPromptValueInterface {
    static lc_name(): string;
    lc_namespace: string[];
    lc_serializable: boolean;
    value: string;
    constructor(value: string);
    toString(): string;
    toChatMessages(): HumanMessage[];
}
/**
 * Interface for the fields of a ChatPromptValue.
 */
export interface ChatPromptValueFields {
    messages: BaseMessage[];
}
/**
 * Class that represents a chat prompt value. It extends the
 * BasePromptValue and includes an array of BaseMessage instances.
 */
export declare class ChatPromptValue extends BasePromptValue implements ChatPromptValueInterface {
    lc_namespace: string[];
    lc_serializable: boolean;
    static lc_name(): string;
    messages: BaseMessage[];
    constructor(messages: BaseMessage[]);
    constructor(fields: ChatPromptValueFields);
    toString(): string;
    toChatMessages(): BaseMessage[];
}
export type ImageContent = {
    /** Specifies the detail level of the image. */
    detail?: "auto" | "low" | "high";
    /** Either a URL of the image or the base64 encoded image data. */
    url: string;
};
export interface ImagePromptValueFields {
    imageUrl: ImageContent;
}
/**
 * Class that represents an image prompt value. It extends the
 * BasePromptValue and includes an ImageURL instance.
 */
export declare class ImagePromptValue extends BasePromptValue {
    lc_namespace: string[];
    lc_serializable: boolean;
    static lc_name(): string;
    imageUrl: ImageContent;
    /** @ignore */
    value: string;
    constructor(fields: ImagePromptValueFields);
    constructor(fields: ImageContent);
    toString(): string;
    toChatMessages(): HumanMessage[];
}
