declare global {
    const Deno: {
        version: {
            deno: string;
        };
    } | undefined;
}
export declare const isBrowser: () => boolean;
export declare const isWebWorker: () => boolean;
export declare const isJsDom: () => boolean;
export declare const isDeno: () => boolean;
export declare const isNode: () => boolean;
export declare const getEnv: () => string;
export type RuntimeEnvironment = {
    library: string;
    libraryVersion?: string;
    sdk: string;
    sdk_version: string;
    runtime: string;
    runtimeVersion?: string;
};
export declare function getRuntimeEnvironment(): RuntimeEnvironment;
/**
 * Retrieves the LangChain-specific environment variables from the current runtime environment.
 * Sensitive keys (containing the word "key", "token", or "secret") have their values redacted for security.
 *
 * @returns {Record<string, string>}
 *  - A record of LangChain-specific environment variables.
 */
export declare function getLangChainEnvVars(): Record<string, string>;
/**
 * Retrieves the LangChain-specific metadata from the current runtime environment.
 *
 * @returns {Record<string, string>}
 *  - A record of LangChain-specific metadata environment variables.
 */
export declare function getLangChainEnvVarsMetadata(): Record<string, string>;
/**
 * Retrieves the environment variables from the current runtime environment.
 *
 * This function is designed to operate in a variety of JS environments,
 * including Node.js, Deno, browsers, etc.
 *
 * @returns {Record<string, string> | undefined}
 *  - A record of environment variables if available.
 *  - `undefined` if the environment does not support or allows access to environment variables.
 */
export declare function getEnvironmentVariables(): Record<string, string> | undefined;
export declare function getEnvironmentVariable(name: string): string | undefined;
export declare function getLangSmithEnvironmentVariable(name: string): string | undefined;
export declare function setEnvironmentVariable(name: string, value: string): void;
interface ICommitSHAs {
    [key: string]: string;
}
/**
 * Get the Git commit SHA from common environment variables
 * used by different CI/CD platforms.
 * @returns {string | undefined} The Git commit SHA or undefined if not found.
 */
export declare function getShas(): ICommitSHAs;
export {};
