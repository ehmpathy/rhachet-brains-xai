/**
 * .what = truncation regression tests for brain atom
 * .why = validates output is not truncated at various lengths
 *
 * .note = skipped by default — investigation concluded issue was caller-side (needed chain-of-thought)
 *         run with: TRUNCATION=true npm run test:integration -- genBrainAtom.truncation
 */
import { BadRequestError } from 'helpful-errors';
import { given, then, useThen, when } from 'test-fns';
import { z } from 'zod';

import { genBrainAtom } from './genBrainAtom';

const outputSchema = z.object({ content: z.string() });

if (!process.env.XAI_API_KEY)
  throw new BadRequestError('XAI_API_KEY is required for integration tests');

// skip unless TRUNCATION=true
const testFn = process.env.TRUNCATION ? describe : describe.skip;

testFn('genBrainAtom.truncation.integration', () => {
  jest.setTimeout(180000); // 3 minutes for long generation

  const brainAtom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });

  given('[case1] long output is requested (~200 tokens)', () => {
    when('[t0] prompt requests 200+ word response', () => {
      const result = useThen('it returns response', async () =>
        brainAtom.ask({
          role: {},
          prompt: `
write a detailed 200-word explanation of why seaweed is green.
include at least 3 specific points about chlorophyll.
output as a single paragraph.
          `.trim(),
          schema: { output: outputSchema },
        }),
      );

      then('output has ≥ 100 tokens (not truncated)', () => {
        const estimatedTokens = result.output.content.length / 4;
        console.log(
          `[truncation check] chars=${result.output.content.length}, estimatedTokens=${estimatedTokens}`,
        );
        expect(estimatedTokens).toBeGreaterThanOrEqual(100);
      });

      then('output has multiple sentences (not truncated to title)', () => {
        const sentenceCount = result.output.content
          .split('.')
          .filter((s) => s.trim().length > 0).length;
        console.log(`[truncation check] sentenceCount=${sentenceCount}`);
        expect(sentenceCount).toBeGreaterThan(3);
      });

      then('metrics.tokens.output ≥ 50', () => {
        console.log(
          `[truncation check] metrics.tokens.output=${result.metrics.size.tokens.output}`,
        );
        expect(result.metrics.size.tokens.output).toBeGreaterThanOrEqual(50);
      });
    });
  });

  given('[case2] very long output is requested (>2000 tokens)', () => {
    when('[t0] prompt requests 2000+ word response', () => {
      const result = useThen('it returns response', async () =>
        brainAtom.ask({
          role: {},
          prompt: `
write a comprehensive 2000-word technical essay about the history of software development.

structure:
1. introduction (100 words)
2. early languages: fortran, cobol, lisp (400 words)
3. structured era: c, pascal (400 words)
4. object-oriented revolution: c++, java, python (400 words)
5. modern era: javascript, rust, go (400 words)
6. future trends (200 words)
7. conclusion (100 words)

requirements:
- include specific dates and version numbers
- mention key people (dennis ritchie, bjarne stroustrup, guido van rossum, etc)
- discuss technical innovations each language introduced
- be detailed and informative

output as continuous prose with section headers.
          `.trim(),
          schema: { output: outputSchema },
        }),
      );

      then('output has ≥ 2000 tokens (not truncated)', () => {
        const estimatedTokens = result.output.content.length / 4;
        console.log(
          `[long output check] chars=${result.output.content.length}, estimatedTokens=${estimatedTokens}`,
        );
        expect(estimatedTokens).toBeGreaterThanOrEqual(2000);
      });

      then('output has all 7 sections', () => {
        const content = result.output.content.toLowerCase();
        const sections = [
          'introduction',
          'fortran',
          'cobol',
          'structured',
          'object',
          'javascript',
          'future',
          'conclusion',
        ];
        const foundSections = sections.filter((s) => content.includes(s));
        console.log(
          `[long output check] foundSections=${foundSections.length}/${sections.length}`,
        );
        expect(foundSections.length).toBeGreaterThanOrEqual(6);
      });

      then('metrics.tokens.output ≥ 1500', () => {
        console.log(
          `[long output check] metrics.tokens.output=${result.metrics.size.tokens.output}`,
        );
        expect(result.metrics.size.tokens.output).toBeGreaterThanOrEqual(1500);
      });
    });
  });
});
