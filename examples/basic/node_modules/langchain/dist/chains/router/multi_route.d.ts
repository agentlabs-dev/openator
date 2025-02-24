import { ChainValues } from "@langchain/core/utils/types";
import { CallbackManagerForChainRun, Callbacks } from "@langchain/core/callbacks/manager";
import { BaseChain, ChainInputs } from "../../chains/base.js";
/**
 * A type that represents the inputs for the MultiRouteChain. It is a
 * recursive type that can contain nested objects, arrays, strings, and
 * numbers.
 */
type Inputs = {
    [key: string]: Inputs | Inputs[] | string | string[] | number | number[];
};
/**
 * An interface that represents the route returned by the RouterChain. It
 * includes optional fields for the destination and nextInputs.
 */
export interface Route {
    destination?: string;
    nextInputs: {
        [key: string]: Inputs;
    };
}
/**
 * An interface that extends the ChainInputs interface and adds additional
 * properties for the routerChain, destinationChains, defaultChain, and
 * silentErrors. It represents the input expected by the MultiRouteChain
 * class.
 */
export interface MultiRouteChainInput extends ChainInputs {
    routerChain: RouterChain;
    destinationChains: {
        [name: string]: BaseChain;
    };
    defaultChain: BaseChain;
    silentErrors?: boolean;
}
/**
 * A class that represents a router chain. It
 * extends the BaseChain class and provides functionality for routing
 * inputs to different chains.
 */
export declare abstract class RouterChain extends BaseChain {
    get outputKeys(): string[];
    route(inputs: ChainValues, callbacks?: Callbacks): Promise<Route>;
}
/**
 * A class that represents a multi-route chain.
 * It extends the BaseChain class and provides functionality for routing
 * inputs to different chains based on a router chain.
 */
export declare class MultiRouteChain extends BaseChain {
    static lc_name(): string;
    routerChain: RouterChain;
    destinationChains: {
        [name: string]: BaseChain;
    };
    defaultChain: BaseChain;
    silentErrors: boolean;
    constructor(fields: MultiRouteChainInput);
    get inputKeys(): string[];
    get outputKeys(): string[];
    _call(values: ChainValues, runManager?: CallbackManagerForChainRun): Promise<ChainValues>;
    _chainType(): string;
}
export {};
