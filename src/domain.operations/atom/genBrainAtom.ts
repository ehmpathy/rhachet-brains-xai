import OpenAI from 'openai';
import {
  BrainAtom,
  type BrainAtomPlugs,
  type BrainEpisode,
  BrainOutput,
  BrainOutputMetrics,
  calcBrainOutputCost,
  castBriefsToPrompt,
  genBrainContinuables,
} from 'rhachet/brains';
import type { Artifact } from 'rhachet-artifact';
import type { GitFile } from 'rhachet-artifact-git';
import type { Empty } from 'type-fns';
import { z } from 'zod';

import { CONFIG_BY_ATOM_SLUG, type XaiBrainAtomSlug } from './BrainAtom.config';

// re-export for consumers
export type { XaiBrainAtomSlug } from './BrainAtom.config';

/**
 * .what = factory to generate xai brain atom instances
 * .why = enables model variant selection via slug
 *
 * .note = xai api is openai-compatible with baseURL override
 *
 * .example
 *   genBrainAtom({ slug: 'xai/grok/code-fast-1' })
 *   genBrainAtom({ slug: 'xai/grok/3-mini' }) // fast + cheap
 *   genBrainAtom({ slug: 'xai/grok/4' }) // advanced
 */
export const genBrainAtom = (input: { slug: XaiBrainAtomSlug }): BrainAtom => {
  const config = CONFIG_BY_ATOM_SLUG[input.slug];

  return new BrainAtom({
    repo: 'xai',
    slug: input.slug,
    description: config.description,
    spec: config.spec,

    /**
     * .what = stateless inference (no tool use)
     * .why = provides direct model access for tasks
     *
     * .note = supports continuation via `on.episode`
     */
    ask: async <TOutput>(
      askInput: {
        on?: { episode: BrainEpisode };
        plugs?: BrainAtomPlugs;
        role: { briefs?: Artifact<typeof GitFile>[] };
        prompt: string;
        schema: { output: z.Schema<TOutput> };
      },
      context?: Empty,
    ): Promise<BrainOutput<TOutput, 'atom'>> => {
      // track start time for elapsed duration
      const startedAt = Date.now();

      // compose system prompt from briefs
      const systemPrompt = askInput.role.briefs
        ? await castBriefsToPrompt({ briefs: askInput.role.briefs })
        : undefined;

      // get openai client from context or create new one with xai baseURL
      const openai =
        (context?.openai as OpenAI | undefined) ??
        new OpenAI({
          apiKey: process.env.XAI_API_KEY,
          baseURL: 'https://api.x.ai/v1',
        });

      // build messages array with prior exchanges for continuation
      const messages: OpenAI.ChatCompletionMessageParam[] = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      if (askInput.on?.episode) {
        for (const exchange of askInput.on.episode.exchanges) {
          messages.push({ role: 'user', content: exchange.input });
          messages.push({ role: 'assistant', content: exchange.output });
        }
      }
      messages.push({ role: 'user', content: askInput.prompt });

      // convert zod schema to json schema for structured output
      const jsonSchema = z.toJSONSchema(askInput.schema.output);

      // call xai api with strict json_schema response format
      const response = await openai.chat.completions.create({
        model: config.model,
        messages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'response',
            strict: true,
            schema: jsonSchema,
          },
        },
      });

      // extract content from response
      const content = response.choices[0]?.message?.content ?? '';

      // parse JSON response and validate via schema
      const parsed = JSON.parse(content);
      const output = askInput.schema.output.parse(parsed);

      // calculate elapsed time
      const elapsedMs = Date.now() - startedAt;

      // extract token usage from response
      const tokensInput = response.usage?.prompt_tokens ?? 0;
      const tokensOutput = response.usage?.completion_tokens ?? 0;
      const tokensCached =
        (
          response.usage as {
            prompt_tokens_details?: { cached_tokens?: number };
          }
        )?.prompt_tokens_details?.cached_tokens ?? 0;

      // calculate character counts
      const charsInput = (systemPrompt?.length ?? 0) + askInput.prompt.length;
      const charsOutput = content.length;

      // define size for metrics and cost calculation
      const size = {
        tokens: {
          input: tokensInput,
          output: tokensOutput,
          cache: { get: tokensCached, set: 0 },
        },
        chars: {
          input: charsInput,
          output: charsOutput,
          cache: { get: 0, set: 0 },
        },
      };

      // calculate cash costs via rhachet utility
      const { cash } = calcBrainOutputCost({
        for: { tokens: size.tokens },
        with: { cost: { cash: config.spec.cost.cash } },
      });

      // build metrics
      const metrics = new BrainOutputMetrics({
        size,
        cost: {
          time: { milliseconds: elapsedMs },
          cash,
        },
      });

      // build continuables (episode + series) for this invocation
      const { episode, series } = await genBrainContinuables({
        for: { grain: 'atom' },
        on: { episode: askInput.on?.episode ?? null, series: null },
        with: {
          exchange: {
            input: askInput.prompt,
            output: content,
            exid: response.id ?? null,
          },
          episode: { exid: response.id ?? null },
        },
      });

      return new BrainOutput({ output, metrics, episode, series });
    },
  });
};
