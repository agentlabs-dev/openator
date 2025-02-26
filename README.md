<p align="center">
  <a href="https://github.com/agentlabs-dev/openator"><img src="https://raw.githubusercontent.com/agentlabs-dev/openator/refs/heads/main/.readme/cover.png" alt="Openator"></a>
</p>

<p align="center">
    <em>.</em>
</p>

<p align=center>
Openator is a state-of-the-art browser agent tool that is capable of planning and executing actions formulated in natural language.
</p>

<p align="center">
This project is under active development and any help or support is welcome.
</p>

<p align="center">
<a href="" target="_blank">
    <img src="https://img.shields.io/badge/License-Apache 2.0-blue.svg" alt="License version">
</a>
<a href="" target="_blank">
    <img src="https://img.shields.io/badge/Status-Under Active Development-green.svg" alt="Docker Image CI">
</a>
</p>

<p align="center">
.
</p>

<h3 align="center">
🌟 Give us some love by starring this repository! 🌟  
</h3>

<p align="center">
.
</p>

## Quick Start

Install the package using npm or yarn.

```bash
npm i openator
```

Spin up your first agent with a task.

```typescript
import { initOpenator, ChatOpenAI } from 'openator';

const main = async () => {
  const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  const openator = initOpenator({
    llm,
    headless: false,
  });

  await openator.start(
    'https://amazon.com',
    'Find a black wirelesskeyboard and return the price.',
  );
};

main();
```

## Add Secrets and Variables

Optionally, you can add variables and secrets to your agent. These variables will be interpolated during runtime by the agent.

This is especially helpful if you want to pass more context to the agent, such as a username and a password.

```typescript
import { initOpenator, Variable, ChatOpenAI } from 'openator';

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const openator = initOpenator({
  headless: false,
  llm,
  variables: [
    new Variable({
      name: 'username',
      value: 'my username',
      isSecret: false,
    }),
    new Variable({
      name: 'password',
      value: process.env.PASSWORD,
      isSecret: true,
    }),
  ],
});

await openator.start(
  'https://my-website.com',
  'Authenticate with the username {{username}} and password {{password}} and then find the latest news on the website.',
);
```

## Available LLM Providers

Optionally you can configure the LLM to use different models or configurations.

We support the following models:

| Platform           | Supported models                                          | Advised model |
| ------------------ | --------------------------------------------------------- | ------------- |
| OpenAI             | gpt-4o, gpt-4o-mini, gpt-4-turbo                          | gpt-4o        |
| Ollama             | qwen2.5, llama3.2                                         | -             |
| GoogleGenerativeAI | gemini-2.0-flash, gemini-2.0-flash-lite, gemini-1.5-flash | -             |

> Note that we benchmarked the performance of Openator on OpenAI gpt-4o and we recommend using it. While you can try other models, we haven't battled-tested them yet.

### OpenAIChat

Here's the configuration type for the ChatOpenAI provider.

```typescript
import { ChatOpenAI } from 'openator';

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4o',
  temperature: 0, // optional
  maxRetries: 3, // optional
  maxConcurrency: 1, // optional
});
```

### OllamaChat

```typescript
import { ChatOllama } from 'openator';

const llm = new ChatOllama({
  model: 'qwen2.5',
  temperature: 0, // optional
  maxRetries: 3, // optional
  maxConcurrency: 1, // optional
  baseUrl: 'http://localhost:11434', // optional
});
```

### GoogleGenerativeAI

```typescript
import { ChatGoogleGenAI } from 'openator';

const llm = new ChatGoogleGenAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  temperature: 0, // optional
  maxRetries: 3, // optional
  maxConcurrency: 1, // optional
});
```

## Demo

Here is what you can build with Openator, you can find more examples and source code in our main repository. The frontend is not included but can be found in our open-source repository.

Example task:

```typescript
await openator.start(
  'https://amazon.com',
  'Purchase a black wireless keyboard',
);
```

<a href="#"><img src="https://github.com/agentlabs-dev/openator/blob/main/.readme/gui-demo.gif?raw=true" alt="agentlabs.dev"></a>

## How it works

<p align="center">
  <a href="#"><img src="https://raw.githubusercontent.com/agentlabs-dev/openator/refs/heads/main/.readme/how-it-works.png" alt="agentlabs.dev"></a>
</p>

<p align="center">
.
</p>

<h3 align="center">
🌟 Give us some love by starring this repository! 🌟  
</h3>

<p align="center">
.
</p>
