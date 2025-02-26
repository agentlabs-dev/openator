import { ChatOpenAI, initOpenator, Variable } from 'openator';

import 'dotenv/config';

const main = async () => {
  try {
    console.log('couoc');
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o',
      temperature: 0,
      maxRetries: 10,
      maxConcurrency: 1,
    });

    const openator = initOpenator({
      llm,
      headless: false,
      variables: [
        new Variable({
          name: 'password',
          value: process.env.PASSWORD!,
          isSecret: true,
        }),
      ],
    });

    console.log('couoc');

    const result = await openator.start(
      'https://amazon.com',
      'Find a black wirelesskeyboard and return the price.',
    );
  } catch (error) {
    console.error(error);
  }
};

main();
