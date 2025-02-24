import { CreateExtensionParams, CreateExtensionResponse, ListExtensionsResponse } from "../types/extension";
import { BaseService } from "./base";
export declare class ExtensionService extends BaseService {
    /**
     * Upload an extension to hyperbrowser
     * @param params Configuration parameters for the new extension
     */
    create(params: CreateExtensionParams): Promise<CreateExtensionResponse>;
    /**
     * List all uploaded extensions for the account
     */
    list(): Promise<ListExtensionsResponse>;
}
