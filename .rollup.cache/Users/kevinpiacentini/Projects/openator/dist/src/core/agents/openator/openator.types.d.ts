import { z } from 'zod';
export declare const ManagerAgentActionSchema: z.ZodUnion<[z.ZodObject<{
    name: z.ZodLiteral<"extractContent">;
    params: z.ZodNull;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    params: null;
    name: "extractContent";
    description: string;
}, {
    params: null;
    name: "extractContent";
    description: string;
}>, z.ZodObject<{
    name: z.ZodLiteral<"clickElement">;
    params: z.ZodObject<{
        index: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        index: number;
    }, {
        index: number;
    }>;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    params: {
        index: number;
    };
    name: "clickElement";
    description: string;
}, {
    params: {
        index: number;
    };
    name: "clickElement";
    description: string;
}>, z.ZodObject<{
    name: z.ZodLiteral<"fillInput">;
    params: z.ZodObject<{
        index: z.ZodNumber;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
        index: number;
    }, {
        text: string;
        index: number;
    }>;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    params: {
        text: string;
        index: number;
    };
    name: "fillInput";
    description: string;
}, {
    params: {
        text: string;
        index: number;
    };
    name: "fillInput";
    description: string;
}>, z.ZodObject<{
    name: z.ZodLiteral<"goBack">;
    description: z.ZodString;
    params: z.ZodNull;
}, "strip", z.ZodTypeAny, {
    params: null;
    name: "goBack";
    description: string;
}, {
    params: null;
    name: "goBack";
    description: string;
}>, z.ZodObject<{
    name: z.ZodLiteral<"scrollDown">;
    description: z.ZodString;
    params: z.ZodNull;
}, "strip", z.ZodTypeAny, {
    params: null;
    name: "scrollDown";
    description: string;
}, {
    params: null;
    name: "scrollDown";
    description: string;
}>, z.ZodObject<{
    name: z.ZodLiteral<"scrollUp">;
    description: z.ZodString;
    params: z.ZodNull;
}, "strip", z.ZodTypeAny, {
    params: null;
    name: "scrollUp";
    description: string;
}, {
    params: null;
    name: "scrollUp";
    description: string;
}>, z.ZodObject<{
    name: z.ZodLiteral<"goToUrl">;
    params: z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    params: {
        url: string;
    };
    name: "goToUrl";
    description: string;
}, {
    params: {
        url: string;
    };
    name: "goToUrl";
    description: string;
}>, z.ZodObject<{
    name: z.ZodLiteral<"takeScreenshot">;
    description: z.ZodString;
    params: z.ZodNull;
}, "strip", z.ZodTypeAny, {
    params: null;
    name: "takeScreenshot";
    description: string;
}, {
    params: null;
    name: "takeScreenshot";
    description: string;
}>, z.ZodObject<{
    name: z.ZodLiteral<"triggerResult">;
    params: z.ZodObject<{
        data: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        data: string;
    }, {
        data: string;
    }>;
    description: z.ZodNull;
}, "strip", z.ZodTypeAny, {
    params: {
        data: string;
    };
    name: "triggerResult";
    description: null;
}, {
    params: {
        data: string;
    };
    name: "triggerResult";
    description: null;
}>]>;
export type ManagerAgentAction = z.infer<typeof ManagerAgentActionSchema>;
export declare const ManagerAgentResponseSchema: z.ZodObject<{
    currentState: z.ZodObject<{
        evaluationPreviousGoal: z.ZodString;
        memory: z.ZodString;
        nextGoal: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        evaluationPreviousGoal: string;
        memory: string;
        nextGoal: string;
    }, {
        evaluationPreviousGoal: string;
        memory: string;
        nextGoal: string;
    }>;
    actions: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        name: z.ZodLiteral<"extractContent">;
        params: z.ZodNull;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        params: null;
        name: "extractContent";
        description: string;
    }, {
        params: null;
        name: "extractContent";
        description: string;
    }>, z.ZodObject<{
        name: z.ZodLiteral<"clickElement">;
        params: z.ZodObject<{
            index: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            index: number;
        }, {
            index: number;
        }>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        params: {
            index: number;
        };
        name: "clickElement";
        description: string;
    }, {
        params: {
            index: number;
        };
        name: "clickElement";
        description: string;
    }>, z.ZodObject<{
        name: z.ZodLiteral<"fillInput">;
        params: z.ZodObject<{
            index: z.ZodNumber;
            text: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            text: string;
            index: number;
        }, {
            text: string;
            index: number;
        }>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        params: {
            text: string;
            index: number;
        };
        name: "fillInput";
        description: string;
    }, {
        params: {
            text: string;
            index: number;
        };
        name: "fillInput";
        description: string;
    }>, z.ZodObject<{
        name: z.ZodLiteral<"goBack">;
        description: z.ZodString;
        params: z.ZodNull;
    }, "strip", z.ZodTypeAny, {
        params: null;
        name: "goBack";
        description: string;
    }, {
        params: null;
        name: "goBack";
        description: string;
    }>, z.ZodObject<{
        name: z.ZodLiteral<"scrollDown">;
        description: z.ZodString;
        params: z.ZodNull;
    }, "strip", z.ZodTypeAny, {
        params: null;
        name: "scrollDown";
        description: string;
    }, {
        params: null;
        name: "scrollDown";
        description: string;
    }>, z.ZodObject<{
        name: z.ZodLiteral<"scrollUp">;
        description: z.ZodString;
        params: z.ZodNull;
    }, "strip", z.ZodTypeAny, {
        params: null;
        name: "scrollUp";
        description: string;
    }, {
        params: null;
        name: "scrollUp";
        description: string;
    }>, z.ZodObject<{
        name: z.ZodLiteral<"goToUrl">;
        params: z.ZodObject<{
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
        }, {
            url: string;
        }>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        params: {
            url: string;
        };
        name: "goToUrl";
        description: string;
    }, {
        params: {
            url: string;
        };
        name: "goToUrl";
        description: string;
    }>, z.ZodObject<{
        name: z.ZodLiteral<"takeScreenshot">;
        description: z.ZodString;
        params: z.ZodNull;
    }, "strip", z.ZodTypeAny, {
        params: null;
        name: "takeScreenshot";
        description: string;
    }, {
        params: null;
        name: "takeScreenshot";
        description: string;
    }>, z.ZodObject<{
        name: z.ZodLiteral<"triggerResult">;
        params: z.ZodObject<{
            data: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            data: string;
        }, {
            data: string;
        }>;
        description: z.ZodNull;
    }, "strip", z.ZodTypeAny, {
        params: {
            data: string;
        };
        name: "triggerResult";
        description: null;
    }, {
        params: {
            data: string;
        };
        name: "triggerResult";
        description: null;
    }>]>, "many">;
}, "strip", z.ZodTypeAny, {
    currentState: {
        evaluationPreviousGoal: string;
        memory: string;
        nextGoal: string;
    };
    actions: ({
        params: null;
        name: "extractContent";
        description: string;
    } | {
        params: {
            index: number;
        };
        name: "clickElement";
        description: string;
    } | {
        params: {
            text: string;
            index: number;
        };
        name: "fillInput";
        description: string;
    } | {
        params: null;
        name: "goBack";
        description: string;
    } | {
        params: null;
        name: "scrollDown";
        description: string;
    } | {
        params: null;
        name: "scrollUp";
        description: string;
    } | {
        params: {
            url: string;
        };
        name: "goToUrl";
        description: string;
    } | {
        params: null;
        name: "takeScreenshot";
        description: string;
    } | {
        params: {
            data: string;
        };
        name: "triggerResult";
        description: null;
    })[];
}, {
    currentState: {
        evaluationPreviousGoal: string;
        memory: string;
        nextGoal: string;
    };
    actions: ({
        params: null;
        name: "extractContent";
        description: string;
    } | {
        params: {
            index: number;
        };
        name: "clickElement";
        description: string;
    } | {
        params: {
            text: string;
            index: number;
        };
        name: "fillInput";
        description: string;
    } | {
        params: null;
        name: "goBack";
        description: string;
    } | {
        params: null;
        name: "scrollDown";
        description: string;
    } | {
        params: null;
        name: "scrollUp";
        description: string;
    } | {
        params: {
            url: string;
        };
        name: "goToUrl";
        description: string;
    } | {
        params: null;
        name: "takeScreenshot";
        description: string;
    } | {
        params: {
            data: string;
        };
        name: "triggerResult";
        description: null;
    })[];
}>;
export type ManagerResponse = z.infer<typeof ManagerAgentResponseSchema>;
export declare const JsonifiedManagerResponseSchema: string;
export declare const ManagerResponseExamples = "\n\nExample Response 1:\n{\n  \"currentState\": {\n    \"evaluationPreviousGoal\": \"Cookies have been accepted. We can now proceed to login.\",\n    \"memory\": \"Cookies accepted, ready to login. End goal is to login to my account.\",\n    \"nextGoal\": \"Display the login form by clicking the login button\",\n  },\n  \"actions\": [{\"name\": \"clickElement\", \"params\": {\"index\": 3}, \"description\": \"Click the login button\"}]\n}\n\nExample Response 2:\n{\n  \"currentState\": {\n    \"evaluationPreviousGoal\": \"An element seems to prevent us from logging in. We need close the cookies popup.\",\n    \"memory\": \"Our end goal is to login to my account. We need to close the cookies popup and then we can proceed to login.\",\n    \"nextGoal\": \"Close cookies popup and then login.\",\n  },\n  \"actions\": [{\"name\": \"clickElement\", \"params\": {\"index\": 5}, \"description\": \"Close the cookies popup\"}]\n}\n\nExample Response 3:\n{\n  \"currentState\": {\n    \"evaluationPreviousGoal\": \"We need to scroll down to find the login form.\",\n    \"memory\": \"We need to scroll down to find the login form. End goal is to login to my account.\",\n    \"nextGoal\": \"Find a recipe that has more than 100 reviews and is not Spicy Vegan Recipe\"\n  },\n   \"actions\": [{\"name\": \"scrollDown\", \"description\": \"Scroll down to find the login form\"}]\n}\n";
