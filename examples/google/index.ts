import { ChatOpenAI, initOpenator } from 'openator';

console.log('coucou');

import 'dotenv/config';

const main = async () => {
  try {
    const llm = new ChatOpenAI({
      apiKey: process.env.OPEN_AI_API_KEY!,
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
