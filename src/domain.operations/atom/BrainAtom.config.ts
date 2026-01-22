import { asIsoPrice, dividePrice } from 'iso-price';
import { BrainSpec } from 'rhachet';

/**
 * .what = atom config type
 * .why = shared type for model configs
 */
export type BrainAtomConfig = {
  model: string;
  description: string;
  spec: BrainSpec;
};

/**
 * .what = supported xai atom slugs
 * .why = enables type-safe slug specification with model variants
 */
export type XaiBrainAtomSlug =
  | 'xai/grok/code-fast-1'
  | 'xai/grok/3'
  | 'xai/grok/3-mini'
  | 'xai/grok/4'
  | 'xai/grok/4-fast-wout-reason'
  | 'xai/grok/4-fast-with-reason'
  | 'xai/grok/4.1-fast-wout-reason'
  | 'xai/grok/4.1-fast-with-reason';

/**
 * .what = model configuration by slug
 * .why = maps slugs to api model names, descriptions, and specs
 *
 * .sources:
 *   - rates: https://docs.x.ai/docs/models
 *   - grok-code-fast-1: https://x.ai/news/grok-code-fast-1
 *   - grok-4 benchmarks: https://x.ai/news/grok-4
 *   - api docs: https://docs.x.ai/docs
 */
export const CONFIG_BY_ATOM_SLUG: Record<XaiBrainAtomSlug, BrainAtomConfig> = {
  /**
   * grok-code-fast-1
   * .sources:
   *   - rates: https://x.ai/news/grok-code-fast-1 ($0.20/1M input, $1.50/1M output, $0.02/1M cached)
   *   - context: https://x.ai/news/grok-code-fast-1 (256K)
   *   - cutoff: https://x.ai/news/grok-code-fast-1 (march 2025)
   *   - swe-bench: https://x.ai/news/grok-code-fast-1 (70.8%)
   */
  'xai/grok/code-fast-1': {
    model: 'grok-code-fast-1',
    description: 'grok-code-fast-1 - optimized for agentic code (256K)',
    spec: new BrainSpec({
      cost: {
        time: {
          speed: { tokens: 200, per: { seconds: 1 } },
          latency: { seconds: 0.5 },
        },
        cash: {
          per: 'token',
          cache: {
            get: dividePrice({ of: '$0.02', by: 1_000_000 }), // $0.02/1M cached
            set: asIsoPrice('$0'),
          },
          input: dividePrice({ of: '$0.20', by: 1_000_000 }), // $0.20/1M tokens
          output: dividePrice({ of: '$1.50', by: 1_000_000 }), // $1.50/1M tokens
        },
      },
      gain: {
        size: { context: { tokens: 256_000 } }, // 256K context
        grades: { swe: 70.8 }, // 70.8% swe-bench verified
        cutoff: '2025-03-01', // march 2025
        domain: 'SOFTWARE',
        skills: { tooluse: true },
      },
    }),
  },
  /**
   * grok-3
   * .sources:
   *   - rates: https://docs.x.ai/docs/models ($3/1M input, $15/1M output, $0.75/1M cached)
   *   - context: https://docs.x.ai/docs/models (131K)
   *   - cutoff: https://x.ai/news/grok-3 (november 2024)
   */
  'xai/grok/3': {
    model: 'grok-3-beta',
    description: 'grok-3 - balanced (131K)',
    spec: new BrainSpec({
      cost: {
        time: {
          speed: { tokens: 100, per: { seconds: 1 } },
          latency: { seconds: 1 },
        },
        cash: {
          per: 'token',
          cache: {
            get: dividePrice({ of: '$0.75', by: 1_000_000 }), // $0.75/1M cached
            set: asIsoPrice('$0'),
          },
          input: dividePrice({ of: '$3', by: 1_000_000 }), // $3/1M tokens
          output: dividePrice({ of: '$15', by: 1_000_000 }), // $15/1M tokens
        },
      },
      gain: {
        size: { context: { tokens: 131_000 } }, // 131K context
        grades: {},
        cutoff: '2024-11-01', // november 2024
        domain: 'ALL',
        skills: { tooluse: true },
      },
    }),
  },
  /**
   * grok-3-mini
   * .sources:
   *   - rates: https://docs.x.ai/docs/models ($0.30/1M input, $0.50/1M output, $0.075/1M cached)
   *   - context: https://docs.x.ai/docs/models (131K)
   *   - cutoff: https://x.ai/news/grok-3 (november 2024)
   */
  'xai/grok/3-mini': {
    model: 'grok-3-mini-beta',
    description: 'grok-3-mini - fast and cost-effective (131K)',
    spec: new BrainSpec({
      cost: {
        time: {
          speed: { tokens: 150, per: { seconds: 1 } },
          latency: { seconds: 0.5 },
        },
        cash: {
          per: 'token',
          cache: {
            get: dividePrice({ of: '$0.075', by: 1_000_000 }), // $0.075/1M cached
            set: asIsoPrice('$0'),
          },
          input: dividePrice({ of: '$0.30', by: 1_000_000 }), // $0.30/1M tokens
          output: dividePrice({ of: '$0.50', by: 1_000_000 }), // $0.50/1M tokens
        },
      },
      gain: {
        size: { context: { tokens: 131_000 } }, // 131K context
        grades: {},
        cutoff: '2024-11-01', // november 2024
        domain: 'ALL',
        skills: { tooluse: true },
      },
    }),
  },
  /**
   * grok-4
   * .sources:
   *   - rates: https://docs.x.ai/docs/models ($3/1M input, $15/1M output, $0.75/1M cached)
   *   - context: https://docs.x.ai/docs/models (256K)
   *   - benchmarks: https://x.ai/news/grok-4 (72-75% swe-bench, 86.6% mmlu, 88% gpqa diamond)
   *   - benchmarks: https://x.com/ArtificialAnlys/status/1943166841150644622 (94% aime 2024)
   *   - cutoff: https://x.ai/news/grok-4 (july 2025)
   */
  'xai/grok/4': {
    model: 'grok-4-07-09',
    description: 'grok-4 - advanced (256K)',
    spec: new BrainSpec({
      cost: {
        time: {
          speed: { tokens: 80, per: { seconds: 1 } },
          latency: { seconds: 1.5 },
        },
        cash: {
          per: 'token',
          cache: {
            get: dividePrice({ of: '$0.75', by: 1_000_000 }), // $0.75/1M cached
            set: asIsoPrice('$0'),
          },
          input: dividePrice({ of: '$3', by: 1_000_000 }), // $3/1M tokens
          output: dividePrice({ of: '$15', by: 1_000_000 }), // $15/1M tokens
        },
      },
      gain: {
        size: { context: { tokens: 256_000 } }, // 256K context
        grades: { swe: 75, mmlu: 86.6, gpqa: 88, aime: 94 } as any, // todo: remove as any next time you see this. the dep will already have been published.
        cutoff: '2025-07-01', // july 2025
        domain: 'ALL',
        skills: { tooluse: true },
      },
    }),
  },
  /**
   * grok-4-fast-wout-reason (non-reasoning)
   * .sources:
   *   - rates: https://x.com/xai/status/1969183335797715149 ($0.20/1M input, $0.50/1M output, $0.05/1M cached)
   *   - context: https://x.ai/news/grok-4-fast (2M)
   *   - cutoff: https://x.ai/news/grok-4 (july 2025)
   */
  'xai/grok/4-fast-wout-reason': {
    model: 'grok-4-fast-non-reasoning',
    description: 'grok-4-fast non-reasoning - fast responses (2M)',
    spec: new BrainSpec({
      cost: {
        time: {
          speed: { tokens: 300, per: { seconds: 1 } },
          latency: { seconds: 0.3 },
        },
        cash: {
          per: 'token',
          cache: {
            get: dividePrice({ of: '$0.05', by: 1_000_000 }), // $0.05/1M cached
            set: asIsoPrice('$0'),
          },
          input: dividePrice({ of: '$0.20', by: 1_000_000 }), // $0.20/1M tokens
          output: dividePrice({ of: '$0.50', by: 1_000_000 }), // $0.50/1M tokens
        },
      },
      gain: {
        size: { context: { tokens: 2_000_000 } }, // 2M context
        grades: {},
        cutoff: '2025-07-01', // july 2025
        domain: 'ALL',
        skills: { tooluse: true },
      },
    }),
  },
  /**
   * grok-4-fast-with-reason (reasoning)
   * .sources:
   *   - rates: https://x.com/xai/status/1969183335797715149 ($0.20/1M input, $0.50/1M output, $0.05/1M cached)
   *   - context: https://x.ai/news/grok-4-fast (2M)
   *   - cutoff: https://x.ai/news/grok-4 (july 2025)
   *   - note: uses chain-of-thought, consumes more tokens but better for complex tasks
   */
  'xai/grok/4-fast-with-reason': {
    model: 'grok-4-fast-reasoning',
    description: 'grok-4-fast reasoning - chain-of-thought (2M)',
    spec: new BrainSpec({
      cost: {
        time: {
          speed: { tokens: 150, per: { seconds: 1 } },
          latency: { seconds: 0.5 },
        },
        cash: {
          per: 'token',
          cache: {
            get: dividePrice({ of: '$0.05', by: 1_000_000 }), // $0.05/1M cached
            set: asIsoPrice('$0'),
          },
          input: dividePrice({ of: '$0.20', by: 1_000_000 }), // $0.20/1M tokens
          output: dividePrice({ of: '$0.50', by: 1_000_000 }), // $0.50/1M tokens
        },
      },
      gain: {
        size: { context: { tokens: 2_000_000 } }, // 2M context
        grades: {},
        cutoff: '2025-07-01', // july 2025
        domain: 'ALL',
        skills: { tooluse: true },
      },
    }),
  },
  /**
   * grok-4.1-fast-wout-reason (non-reasoning)
   * .sources:
   *   - rates: https://blog.galaxy.ai/model/grok-4-1-fast ($0.20/1M input, $0.50/1M output, $0.05/1M cached)
   *   - context: https://x.ai/news/grok-4-1-fast (2M)
   *   - release: https://x.ai/news/grok-4-1-fast (november 2025)
   *   - note: successor to grok-4-fast, better tool call and lower hallucination
   */
  'xai/grok/4.1-fast-wout-reason': {
    model: 'grok-4-1-fast-non-reasoning',
    description: 'grok-4.1-fast non-reasoning - best tool call (2M)',
    spec: new BrainSpec({
      cost: {
        time: {
          speed: { tokens: 300, per: { seconds: 1 } },
          latency: { seconds: 0.3 },
        },
        cash: {
          per: 'token',
          cache: {
            get: dividePrice({ of: '$0.05', by: 1_000_000 }), // $0.05/1M cached
            set: asIsoPrice('$0'),
          },
          input: dividePrice({ of: '$0.20', by: 1_000_000 }), // $0.20/1M tokens
          output: dividePrice({ of: '$0.50', by: 1_000_000 }), // $0.50/1M tokens
        },
      },
      gain: {
        size: { context: { tokens: 2_000_000 } }, // 2M context
        grades: {},
        cutoff: '2025-11-01', // november 2025
        domain: 'ALL',
        skills: { tooluse: true },
      },
    }),
  },
  /**
   * grok-4.1-fast-with-reason (reasoning)
   * .sources:
   *   - rates: https://blog.galaxy.ai/model/grok-4-1-fast ($0.20/1M input, $0.50/1M output, $0.05/1M cached)
   *   - context: https://x.ai/news/grok-4-1-fast (2M)
   *   - release: https://x.ai/news/grok-4-1-fast (november 2025)
   *   - benchmark: https://llm-stats.com/models/grok-4-1-fast-reasoning (64 intelligence, ~79% swe-bench)
   *   - note: near grok-4 capability at 1/15th price
   */
  'xai/grok/4.1-fast-with-reason': {
    model: 'grok-4-1-fast-reasoning',
    description: 'grok-4.1-fast reasoning - near grok-4 capability (2M)',
    spec: new BrainSpec({
      cost: {
        time: {
          speed: { tokens: 150, per: { seconds: 1 } },
          latency: { seconds: 0.5 },
        },
        cash: {
          per: 'token',
          cache: {
            get: dividePrice({ of: '$0.05', by: 1_000_000 }), // $0.05/1M cached
            set: asIsoPrice('$0'),
          },
          input: dividePrice({ of: '$0.20', by: 1_000_000 }), // $0.20/1M tokens
          output: dividePrice({ of: '$0.50', by: 1_000_000 }), // $0.50/1M tokens
        },
      },
      gain: {
        size: { context: { tokens: 2_000_000 } }, // 2M context
        grades: { swe: 79 }, // ~79% swe-bench
        cutoff: '2025-11-01', // november 2025
        domain: 'ALL',
        skills: { tooluse: true },
      },
    }),
  },
};
