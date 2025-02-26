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

## LLM Configuration

Optionally you can configure the LLM to use different models or configurations.

Here is an example of how to customize the ChatOpenAI provider (more providers will be added soon).

### OpenAIChat

Here's the configuration type for the ChatOpenAI provider.

```typescript
export type ChatOpenAIConfig = {
  /**
   * The model to use.
   * @default gpt-4o
   */
  model?: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo';
  /**
   * The temperature to use. We recommend setting this to 0 for consistency.
   * @default 0
   */
  temperature?: number;
  /**
   * The maximum number of retries.
   * This is usefull when you have a low quota such as Tier 1 or 2.
   * @default 6
   */
  maxRetries?: number;
  /**
   * The maximum number of concurrent requests.
   * Set it to a low value if you have a low quota such as Tier 1 or 2.
   * @default 2
   */
  maxConcurrency?: number;
  /**
   * The OpenAI API key to use
   */
  apiKey: string;
};
```

```typescript
import { ChatOpenAI } from 'openator';

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  modelName: 'gpt-4o',
  temperature: 0,
  maxRetries: 3,
  maxConcurrency: 1,
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
