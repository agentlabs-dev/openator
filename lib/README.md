<p align="center">
  <a href="https://github.com/agentlabs-dev/openator"><img src="./.readme/cover.png" alt="Magic Inspector"></a>
</p>

<p align="center">
    <em>.</em>
</p>

<p align=center>
Your Open-Source Browser Operator — Openator is a state-of-the-art browser agent tool that is capable of planning and executing actions formulated in natural language.
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

Install the package and playwright using npm or yarn.

```bash
npm i openator playwright
```

Spin up your first agent with a task.

```typescript
import { initOpenator } from 'openator';

const main = async () => {
  const openator = initOpenator({
    headless: true,
    openAiApiKey: process.env.OPENAI_API_KEY,
  });

  await openator.launch(
    'https://amazon.com',
    'Find a black wirelesskeyboard and return the price.',
  );
};

main();
```

## Demos

We're also working on a web application that will allow you to interact with the agent directly. Here are some demos of what you can build with Openator.

### GUI VERSION

https://github.com/user-attachments/assets/c197b6a3-05de-4e2d-8b61-b75668f92d6e

### CLI VERSION

Log in to my account with 'demo@magicinspector.com' and 'demopassword' and create a new test inside the Default Project. Once the test has been created, I can see the test editor.

https://github.com/user-attachments/assets/7873f6a8-89d5-4234-8a17-0d993f5dc5c7

## How it works

<p align="center">
  <a href="https://magicinspector.com"><img src="./.readme/how-it-works.png" alt="agentlabs.dev"></a>
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
