import { BadRequestError } from 'helpful-errors';
import { genContextBrainSupplier } from 'rhachet';
import { getError, given, then, when } from 'test-fns';
import { z } from 'zod';

import { type BrainSuppliesXai, genBrainAtom } from '@src/contract/sdk';

if (!process.env.XAI_API_KEY)
  throw new BadRequestError('XAI_API_KEY is required for acceptance tests');

// store the real api key for test context suppliers
const realApiKey = process.env.XAI_API_KEY;

describe('sdk.credentials.acceptance', () => {
  jest.setTimeout(60000);

  given('[case1] adhoc credentials via context supplier', () => {
    when('[t0] ask is called with context from genContextBrainSupplier', () => {
      then('creds are sourced from context, not env', async () => {
        // track that our getter was called
        let getterCalled = false;

        // create context via rhachet's factory
        const context = genContextBrainSupplier<'xai', BrainSuppliesXai>(
          'xai',
          {
            creds: async () => {
              getterCalled = true;
              return { XAI_API_KEY: realApiKey };
            },
          },
        );

        // use sdk exports
        const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
        const result = await atom.ask(
          {
            role: {},
            prompt: 'what is 2+2?',
            schema: { output: z.object({ message: z.string() }) },
          },
          context,
        );

        // verify getter was invoked
        expect(getterCalled).toBe(true);
        expect(result.output).not.toBeNull();
      });
    });
  });

  given('[case2] invalid credentials via context', () => {
    when('[t0] context supplies bad api key', () => {
      then('request fails with auth error', async () => {
        const context = genContextBrainSupplier<'xai', BrainSuppliesXai>(
          'xai',
          {
            creds: async () => ({ XAI_API_KEY: 'invalid-key-for-test' }),
          },
        );

        const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
        const error = await getError(
          atom.ask(
            {
              role: {},
              prompt: 'hello',
              schema: { output: z.object({ message: z.string() }) },
            },
            context,
          ),
        );

        expect(error).toBeDefined();
        // xai returns 400 for invalid api key
        expect(error.message).toMatch(/400|401|Incorrect API key/i);
      });
    });
  });
});
