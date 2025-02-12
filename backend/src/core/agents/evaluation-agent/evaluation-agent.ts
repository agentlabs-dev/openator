import { LLM } from "@/core/interfaces/llm.interface";
import {
  EvaluationAgentHumanPrompt,
  EvaluationAgentPrompt,
} from "./evaluation-agent.prompt";
import { Browser } from "@/core/interfaces/browser.interface";
import { Screenshotter } from "@/core/interfaces/screenshotter.interface";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { EvaluationAgentResponse } from "./evaluation-agent.types";
import { AgentReporter } from "@/core/interfaces/agent-reporter.interface";

export class EvaluationAgent {
  constructor(
    private readonly llm: LLM,
    private readonly browser: Browser,
    private readonly screenshotter: Screenshotter,
    private readonly reporter: AgentReporter,
  ) {}

  async evaluateTestResult(
    serializedTaskHistory: string,
    userStory: string,
  ): Promise<EvaluationAgentResponse> {
    const systemMessage = new EvaluationAgentPrompt().getSystemMessage();

    const page = await this.browser.getStablePage();
    const screenshotUrl = await this.screenshotter.takeScreenshot(page);

    this.reporter.loading("Evaluating test result...");

    const humanMessage = new EvaluationAgentHumanPrompt().getHumanMessage({
      serializedTask: serializedTaskHistory,
      pageUrl: this.browser.getPageUrl(),
      screenshotUrl,
      userStory,
    });

    const parser = new JsonOutputParser<EvaluationAgentResponse>();

    const messages = [systemMessage, humanMessage];

    const response = await this.llm.invokeAndParse(messages, parser);

    if (response.status === "passed") {
      this.reporter.success("Test result evaluated successfully");
    } else {
      this.reporter.failure(
        `Test result evaluation failed: ${response.reason}`,
      );
    }

    return response;
  }
}
