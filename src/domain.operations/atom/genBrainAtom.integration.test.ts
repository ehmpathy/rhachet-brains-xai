import { BadRequestError } from 'helpful-errors';
import path from 'path';
import { genArtifactGitFile } from 'rhachet-artifact-git';
import { given, then, useThen, when } from 'test-fns';
import { z } from 'zod';

import { TEST_ASSETS_DIR } from '../../.test/assets/dir';
import { genBrainAtom } from './genBrainAtom';

const BRIEFS_DIR = path.join(TEST_ASSETS_DIR, '/example.briefs');

const outputSchema = z.object({ content: z.string() });

if (!process.env.XAI_API_KEY)
  throw new BadRequestError('XAI_API_KEY is required for integration tests');

describe('genBrainAtom.integration', () => {
  jest.setTimeout(30000);

  // use grok-code-fast-1 for fast integration tests
  const brainAtom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });

  given('[case1] genBrainAtom({ slug: "xai/grok/code-fast-1" })', () => {
    when('[t0] atom is created', () => {
      then('repo is "xai"', () => {
        expect(brainAtom.repo).toEqual('xai');
      });

      then('slug is "xai/grok/code-fast-1"', () => {
        expect(brainAtom.slug).toEqual('xai/grok/code-fast-1');
      });

      then('description is defined', () => {
        expect(brainAtom.description).toBeDefined();
        expect(brainAtom.description.length).toBeGreaterThan(0);
      });
    });
  });

  given('[case2] ask is called', () => {
    when('[t0] with simple prompt', () => {
      // call the operation once and share result across assertions
      const result = useThen('it returns a response', async () =>
        brainAtom.ask({
          role: {},
          prompt: 'respond with exactly: hello world',
          schema: { output: outputSchema },
        }),
      );

      then('response contains "hello"', () => {
        expect(result.output.content).toBeDefined();
        expect(result.output.content.length).toBeGreaterThan(0);
        expect(result.output.content.toLowerCase()).toContain('hello');
      });

      then('metrics includes token counts', () => {
        expect(result.metrics.size.tokens.input).toBeGreaterThan(0);
        expect(result.metrics.size.tokens.output).toBeGreaterThan(0);
      });

      then('metrics includes cash costs', () => {
        expect(result.metrics.cost.cash.deets.input).toBeDefined();
        expect(result.metrics.cost.cash.deets.output).toBeDefined();
        expect(result.metrics.cost.cash.total).toBeDefined();
      });

      then('metrics includes time cost', () => {
        expect(result.metrics.cost.time).toBeDefined();
      });
    });

    when('[t1] with briefs', () => {
      then('response leverages knowledge from brief', async () => {
        const briefs = [
          genArtifactGitFile({
            uri: path.join(BRIEFS_DIR, 'secret-code.brief.md'),
          }),
        ];
        const result = await brainAtom.ask({
          role: { briefs },
          prompt: 'say hello',
          schema: { output: outputSchema },
        });
        expect(result.output.content).toBeDefined();
        expect(result.output.content).toContain('ZEBRA42');
      });
    });
  });

  given('[case3] episode continuation', () => {
    when('[t0] ask is called with initial prompt', () => {
      const resultFirst = useThen('it succeeds', async () =>
        brainAtom.ask({
          role: {},
          prompt:
            'remember this secret code: MANGO77. respond with "code received"',
          schema: { output: outputSchema },
        }),
      );

      then('it returns an episode', () => {
        expect(resultFirst.episode).toBeDefined();
        expect(resultFirst.episode.hash).toBeDefined();
        expect(resultFirst.episode.exchanges).toHaveLength(1);
      });

      then('series is null for atoms', () => {
        expect(resultFirst.series).toBeNull();
      });
    });

    when('[t1] ask is called with continuation via on.episode', () => {
      const resultFirst = useThen('first ask succeeds', async () =>
        brainAtom.ask({
          role: {},
          prompt:
            'remember this secret code: PAPAYA99. respond with "code stored"',
          schema: { output: outputSchema },
        }),
      );

      const resultSecond = useThen('second ask succeeds', async () =>
        brainAtom.ask({
          on: { episode: resultFirst.episode },
          role: {},
          prompt: 'what was the secret code i told you to remember?',
          schema: { output: outputSchema },
        }),
      );

      then('continuation remembers context from prior exchange', () => {
        expect(resultSecond.output.content).toContain('PAPAYA99');
      });

      then('episode accumulates exchanges', () => {
        expect(resultSecond.episode.exchanges).toHaveLength(2);
      });
    });
  });
});
