export const promptLayerTrackRequest = async (callerFunc, functionName, kwargs, plTags, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
requestResponse, startTime, endTime, apiKey) => {
    // https://github.com/MagnivOrg/promptlayer-js-helper
    const promptLayerResp = await callerFunc.call(fetch, "https://api.promptlayer.com/track-request", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            function_name: functionName,
            provider: "langchain",
            kwargs,
            tags: plTags,
            request_response: requestResponse,
            request_start_time: Math.floor(startTime / 1000),
            request_end_time: Math.floor(endTime / 1000),
            api_key: apiKey,
        }),
    });
    return promptLayerResp.json();
};
