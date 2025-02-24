import { Openator } from './core/agents/openator/openator';
export * from './core/types';
export type InitOpenatorOptions = {
    headless: boolean;
    openAiApiKey: string;
};
export declare const initOpenator: (options: InitOpenatorOptions) => Openator;
