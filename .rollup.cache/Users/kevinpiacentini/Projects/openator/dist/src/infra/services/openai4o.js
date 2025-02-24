import { ChatOpenAI } from '@langchain/openai';
import 'dotenv/config';
export class OpenAI4o {
    constructor(openAiApiKey) {
        this.model = new ChatOpenAI({
            model: 'gpt-4o',
            temperature: 0,
            openAIApiKey: openAiApiKey,
        });
    }
    async invokeAndParse(messages, parser) {
        const response = await this.model.invoke(messages, {
            response_format: { type: 'json_object' },
        });
        return parser.invoke(response);
    }
}
//# sourceMappingURL=openai4o.js.map