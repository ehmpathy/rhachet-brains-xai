import { BadRequestError } from 'helpful-errors';
import { genContextBrainSupplier } from 'rhachet';
import { getError, given, then, when } from 'test-fns';
import { z } from 'zod';

import { type BrainSuppliesXai, genBrainAtom } from './genBrainAtom';

if (!process.env.XAI_API_KEY)
  throw new BadRequestError('XAI_API_KEY is required for integration tests');

// store the real api key for test context suppliers
const realApiKey = process.env.XAI_API_KEY;

describe('genBrainAtom.credentials.integration', () => {
  jest.setTimeout(60000); // increased for multiple api calls

  given('[case1] context with creds getter', () => {
    when('[t0] ask is called with context supplier', () => {
      then('creds getter is called and used', async () => {
        // track getter invocations
        let getterCallCount = 0;

        const context = genContextBrainSupplier<'xai', BrainSuppliesXai>(
          'xai',
          {
            creds: async () => {
              getterCallCount += 1;
              return { XAI_API_KEY: realApiKey };
            },
          },
        );

        const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
        const result = await atom.ask(
          {
            role: {},
            prompt: 'reply with exactly: "hello from context"',
            schema: { output: z.object({ message: z.string() }) },
          },
          context,
        );

        expect(getterCallCount).toBeGreaterThan(0);
        expect(result.output).not.toBeNull();
      });
    });
  });

  given('[case2] getter called fresh per ask', () => {
    when('[t0] ask is called multiple times', () => {
      then('getter is invoked each time', async () => {
        let getterCallCount = 0;

        const context = genContextBrainSupplier<'xai', BrainSuppliesXai>(
          'xai',
          {
            creds: async () => {
              getterCallCount += 1;
              return { XAI_API_KEY: realApiKey };
            },
          },
        );

        const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });

        // first ask
        await atom.ask(
          {
            role: {},
            prompt: 'reply: "first"',
            schema: { output: z.object({ message: z.string() }) },
          },
          context,
        );
        const countAfterFirst = getterCallCount;

        // second ask
        await atom.ask(
          {
            role: {},
            prompt: 'reply: "second"',
            schema: { output: z.object({ message: z.string() }) },
          },
          context,
        );
        const countAfterSecond = getterCallCount;

        expect(countAfterFirst).toEqual(1);
        expect(countAfterSecond).toEqual(2);
      });
    });
  });

  given('[case3] getter error propagation', () => {
    when('[t0] creds getter throws', () => {
      then('error propagates with message', async () => {
        const context = genContextBrainSupplier<'xai', BrainSuppliesXai>(
          'xai',
          {
            creds: async () => {
              throw new Error('vault unreachable');
            },
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
        expect(error.message).toContain('vault unreachable');
      });
    });
  });

  given('[case4] multi-tenant isolation', () => {
    when('[t0] different contexts with different getters', () => {
      then('each call uses its own context creds', async () => {
        // track which api key was used per call
        const apiKeysUsed: string[] = [];

        const contextA = genContextBrainSupplier<'xai', BrainSuppliesXai>(
          'xai',
          {
            creds: async () => {
              apiKeysUsed.push('keyA');
              return { XAI_API_KEY: realApiKey }; // same key for api call to succeed
            },
          },
        );

        const contextB = genContextBrainSupplier<'xai', BrainSuppliesXai>(
          'xai',
          {
            creds: async () => {
              apiKeysUsed.push('keyB');
              return { XAI_API_KEY: realApiKey }; // same key for api call to succeed
            },
          },
        );

        const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });

        // call with context A
        await atom.ask(
          {
            role: {},
            prompt: 'reply: "a"',
            schema: { output: z.object({ message: z.string() }) },
          },
          contextA,
        );

        // call with context B
        await atom.ask(
          {
            role: {},
            prompt: 'reply: "b"',
            schema: { output: z.object({ message: z.string() }) },
          },
          contextB,
        );

        expect(apiKeysUsed).toEqual(['keyA', 'keyB']);
      });
    });
  });
});
