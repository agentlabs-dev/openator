export interface CreateExtensionParams {
    filePath: string;
    name?: string;
}
interface ExtensionResponse {
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
}
export type CreateExtensionResponse = ExtensionResponse;
export type ListExtensionsResponse = Array<ExtensionResponse>;
export {};
