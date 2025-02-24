/* eslint-disable no-param-reassign */
import { getEnvironmentVariable } from "@langchain/core/utils/env";
import { OpenAI as OpenAIClient } from "openai";
import { Tool } from "@langchain/core/tools";
/**
 * A tool for generating images with Open AIs Dall-E 2 or 3 API.
 */
export class DallEAPIWrapper extends Tool {
    static lc_name() {
        return "DallEAPIWrapper";
    }
    constructor(fields) {
        // Shim for new base tool param name
        if (fields?.responseFormat !== undefined &&
            ["url", "b64_json"].includes(fields.responseFormat)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fields.dallEResponseFormat = fields.responseFormat;
            fields.responseFormat = "content";
        }
        super(fields);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "dalle_api_wrapper"
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "A wrapper around OpenAI DALL-E API. Useful for when you need to generate images from a text description. Input should be an image description."
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "dall-e-3"
        });
        Object.defineProperty(this, "style", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "vivid"
        });
        Object.defineProperty(this, "quality", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "standard"
        });
        Object.defineProperty(this, "n", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "1024x1024"
        });
        Object.defineProperty(this, "dallEResponseFormat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "url"
        });
        Object.defineProperty(this, "user", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const openAIApiKey = fields?.apiKey ??
            fields?.openAIApiKey ??
            getEnvironmentVariable("OPENAI_API_KEY");
        const organization = fields?.organization ?? getEnvironmentVariable("OPENAI_ORGANIZATION");
        const clientConfig = {
            apiKey: openAIApiKey,
            organization,
            dangerouslyAllowBrowser: true,
            baseUrl: fields?.baseUrl,
        };
        this.client = new OpenAIClient(clientConfig);
        this.model = fields?.model ?? fields?.modelName ?? this.model;
        this.style = fields?.style ?? this.style;
        this.quality = fields?.quality ?? this.quality;
        this.n = fields?.n ?? this.n;
        this.size = fields?.size ?? this.size;
        this.dallEResponseFormat =
            fields?.dallEResponseFormat ?? this.dallEResponseFormat;
        this.user = fields?.user;
    }
    /**
     * Processes the API response if multiple images are generated.
     * Returns a list of MessageContentImageUrl objects. If the response
     * format is `url`, then the `image_url` field will contain the URL.
     * If it is `b64_json`, then the `image_url` field will contain an object
     * with a `url` field with the base64 encoded image.
     *
     * @param {OpenAIClient.Images.ImagesResponse[]} response The API response
     * @returns {MessageContentImageUrl[]}
     */
    processMultipleGeneratedUrls(response) {
        if (this.dallEResponseFormat === "url") {
            return response.flatMap((res) => {
                const imageUrlContent = res.data
                    .flatMap((item) => {
                    if (!item.url)
                        return [];
                    return {
                        type: "image_url",
                        image_url: item.url,
                    };
                })
                    .filter((item) => item !== undefined &&
                    item.type === "image_url" &&
                    typeof item.image_url === "string" &&
                    item.image_url !== undefined);
                return imageUrlContent;
            });
        }
        else {
            return response.flatMap((res) => {
                const b64Content = res.data
                    .flatMap((item) => {
                    if (!item.b64_json)
                        return [];
                    return {
                        type: "image_url",
                        image_url: {
                            url: item.b64_json,
                        },
                    };
                })
                    .filter((item) => item !== undefined &&
                    item.type === "image_url" &&
                    typeof item.image_url === "object" &&
                    "url" in item.image_url &&
                    typeof item.image_url.url === "string" &&
                    item.image_url.url !== undefined);
                return b64Content;
            });
        }
    }
    /** @ignore */
    async _call(input) {
        const generateImageFields = {
            model: this.model,
            prompt: input,
            n: 1,
            size: this.size,
            response_format: this.dallEResponseFormat,
            style: this.style,
            quality: this.quality,
            user: this.user,
        };
        if (this.n > 1) {
            const results = await Promise.all(Array.from({ length: this.n }).map(() => this.client.images.generate(generateImageFields)));
            return this.processMultipleGeneratedUrls(results);
        }
        const response = await this.client.images.generate(generateImageFields);
        let data = "";
        if (this.dallEResponseFormat === "url") {
            [data] = response.data
                .map((item) => item.url)
                .filter((url) => url !== "undefined");
        }
        else {
            [data] = response.data
                .map((item) => item.b64_json)
                .filter((b64_json) => b64_json !== "undefined");
        }
        return data;
    }
}
Object.defineProperty(DallEAPIWrapper, "toolName", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: "dalle_api_wrapper"
});
