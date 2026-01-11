import { BadRequestError } from 'helpful-errors';
import path from 'path';
import { genArtifactGitFile } from 'rhachet-artifact-git';
import { given, then, when } from 'test-fns';
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
  const brainAtom = genBrainAtom({ slug: 'xai/grok-code-fast-1' });

  given('[case1] genBrainAtom({ slug: "xai/grok-code-fast-1" })', () => {
    when('[t0] atom is created', () => {
      then('repo is "xai"', () => {
        expect(brainAtom.repo).toEqual('xai');
      });

      then('slug is "xai/grok-code-fast-1"', () => {
        expect(brainAtom.slug).toEqual('xai/grok-code-fast-1');
      });

      then('description is defined', () => {
        expect(brainAtom.description).toBeDefined();
        expect(brainAtom.description.length).toBeGreaterThan(0);
      });
    });
  });

  given('[case2] ask is called', () => {
    when('[t0] with simple prompt', () => {
      then('it returns a substantive response', async () => {
        const result = await brainAtom.ask({
          role: {},
          prompt: 'respond with exactly: hello world',
          schema: { output: outputSchema },
        });
        expect(result.content).toBeDefined();
        expect(result.content.length).toBeGreaterThan(0);
        expect(result.content.toLowerCase()).toContain('hello');
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
        expect(result.content).toBeDefined();
        expect(result.content).toContain('ZEBRA42');
      });
    });
  });
});
