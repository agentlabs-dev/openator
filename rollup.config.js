// Contents of the file /rollup.config.js
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

const config = [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
    external: [
      'events',
      'ora-classic',
      'crypto',
      'jsdom',
      'playwright',
      'dotenv/config',
      'dom-to-semantic-markdown',
      '@langchain/core/output_parsers',
      '@langchain/openai',
      '@langchain/core/messages',
      'zod',
      'zod-to-json-schema',
    ],
    plugins: [
      typescript({
        exclude: ['examples/**'],
      }),
      json(),
    ],
  },
];
export default config;
