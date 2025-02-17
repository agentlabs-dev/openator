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


# Open-Source browser operator

Openator is <b>fully open-sourced (Apache 2.0)</b>.


## Demo 

### GUI VERSION

https://github.com/user-attachments/assets/98881b79-eb63-4d10-aedf-f52ad64aecd5

### CLI VERSION

Log in to my account with 'demo@magicinspector.com' and 'demopassword' and create a new test inside the Default Project. Once the test has been created, I can see the test editor.

https://github.com/user-attachments/assets/7873f6a8-89d5-4234-8a17-0d993f5dc5c7

## How it works

<p align="center">
  <a href="https://magicinspector.com"><img src="./.readme/how-it-works.png" alt="agentlabs.dev"></a>
</p>

## Getting Started

ℹ️ Note: Openator is currently in development and not ready to self-host. Stay tuned for updates.

Openator is available as a CLI utility and as a web application.
- The GUI web version is the easiest way to get started if you just to play with the agent.
- The CLI is probably more adapted to improve the agent and add new features to the core.

### GUI Version


> This is work in progress


### CLI Version

#### Prerequisites

ℹ️ Note: Openator requires Node.js version 20 or higher.


#### Clone the repository and go to the backend folder

```bash
git clone git@github.com:agentlabs-dev/openator.git
cd openator/backend

npm install
```

#### Add your OpenAI API key

```
echo OPENAI_API_KEY="<replace-with-your-key>" >> .env
```

#### Usage

```bash
npm run openator [-- options]
```

| Option                | Description                                                                                       |
|-----------------------|---------------------------------------------------------------------------------------------------|
| -f, --file <FILE>     | Specify the file containing WebVoyager test cases. Default to our web voyager benchmark.                                                |
| -w, --web <WEBSITE>   | The website name to run the benchmark on (e.g., Allrecipes, Amazon). Default: Runs on all available websites. |
| -t, --threads <THREADS> | The number of threads to run the benchmark on. Default: 1                                      |
| -h, --headless        | Run the benchmark in headless mode. Default: false                                                |
| -i, --id <TASK_ID>    | The task id to run. Default to all.                                                                 |
| -o, --output <OUTPUT_PATH> | The path to save the benchmark results. Default to eval/answers.json. |

##### Example

```bash
npm run openator -- --web=Amazon --threads=5 --headless
```

## Roadmap for a stable release

We're committed to improving the project, feel free to open an issue if you have any suggestions or feedback.

| Component                | Status | Features                                                                                                                                    |
|:-------------------------|:------:|---------------------------------------------------------------------------------------------------------------------------------------------|
| Alpha release       |  ✅️️   | <ul><li>Release a first minimap version that is able to run a test</li></ul>      
| Add support for variables and secrets       |  ✅️️    | <ul><li>The agent can take variables and secrets from the user story</li><li>Secrets are not displayed in the logs or sent to the LLM</li></ul> 
| Run multiple cases from a test file       |  ✅️️    | <ul><li>Check the `npm run example:file` command for more information</li></ul> 
| Interrupt actions when dom changes |  ✅️  | <ul><li>We need to interrupt the action if the interactives elements change after one action</li></ul>
| Wait page stabilized before evaluation |  ✅️   | <ul><li>Wait for the domContentLoaded event to be fired</li><li>Wait for a minimal time to make sure the page is stable</li></ul> 
| Manage completion at the action level  | ✅️   | <ul><li>We must manage completion at the action level insted of the task level to make sure the agent does not restart filling inputs over and over</li></ul>
| Update UI version to display steps in real-time | 🏗️   | <ul><li>Update the UI to show the steps generated by the agent in real-time</li></ul>
| Add unit tests  | 🏗️   | <ul><li>Add vitest to test business logic</li></ul>
| Manager multiple tabs  | 🏗️   | <ul><li>We must listen to the tab events and manage the tabs</li></ul> 
| Persist voyager results in file       |  🏗️   | <ul><li>we need to persist screenshots and results in a file for every test we run</li></ul>     
| Refine user inputs       |  🏗️   | <ul><li>We must make sure that the Manager Agent and the Evaluation Agent get distinct inputs so the Manager Agent does not try to update its behavior based on the expected result</li></ul>                                                             |
| Provide a GUI |    🏗️   | <ul><li>Add docker configuration</li><li>Add a simple UI to create a test</li></ul> |
| Allow to launch the Web Voyager benchmark in multiple threads      |  ✅️  | <ul><li>The only serious way to improve the agent is to build a serious benchmark dedicated to the web testing.</li></ul>     
| Add OpenAI YAML spec and generate frontend SDK dynamically | 🏗️   | <ul><li>Automatically add OpenAI YAML specification</li><li>Generate frontend SDK dynamically based on the specification</li></ul>





<p align="center">
.
</p>

<h3 align="center">
🌟 Give us some love by starring this repository! 🌟  
</h3>

<p align="center">
.
</p>


