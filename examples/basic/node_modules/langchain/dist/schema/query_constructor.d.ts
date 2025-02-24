/**
 * A simple data structure that holds information about an attribute. It
 * is typically used to provide metadata about attributes in other classes
 * or data structures within the LangChain framework.
 * @deprecated
 */
export declare class AttributeInfo {
    name: string;
    type: string;
    description: string;
    constructor(name: string, type: string, description: string);
}
