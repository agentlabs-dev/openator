import { ChatOllama, initOpenator } from 'openator';

const main = async () => {
  try {
    const llm = new ChatOllama({
      model: 'qwen2.5',
      temperature: 0,
      maxRetries: 10,
      maxConcurrency: 1,
      baseUrl: 'http://127.0.0.1:11434',
    });

    const openator = initOpenator({
      llm,
      headless: false,
    });

    const result = await openator.start(
      'https://amazon.com',
      'Find a black wirelesskeyboard and return the price.',
    );
  } catch (error) {
    console.error(error);
  }
};

main();
