# rhachet-brains-xai

rhachet brain.atom adapter for xai grok models

## install

```sh
npm install rhachet-brains-xai
```

## usage

```ts
import { genBrainAtom } from 'rhachet-brains-xai';
import { z } from 'zod';

// create a brain atom for direct model inference
const brainAtom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });

// simple string output
const { output: explanation } = await brainAtom.ask({
  role: { briefs: [] },
  prompt: 'explain this code',
  schema: { output: z.string() },
});

// structured object output
const { output: { summary, issues } } = await brainAtom.ask({
  role: { briefs: [] },
  prompt: 'analyze this code',
  schema: { output: z.object({ summary: z.string(), issues: z.array(z.string()) }) },
});
```

## available brains

### atoms (via genBrainAtom)

stateless inference without tool use.

| slug                            | model                       | context | cutoff   | input    | output   | cache     |
| ------------------------------- | --------------------------- | ------- | -------- | -------- | -------- | --------- |
| `xai/grok/code-fast-1`          | grok-code-fast-1            | 256K    | mar 2025 | $0.20/1M | $1.50/1M | $0.02/1M  |
| `xai/grok/3`                    | grok-3-beta                 | 131K    | nov 2024 | $3/1M    | $15/1M   | $0.75/1M  |
| `xai/grok/3-mini`               | grok-3-mini-beta            | 131K    | nov 2024 | $0.30/1M | $0.50/1M | $0.075/1M |
| `xai/grok/4`                    | grok-4-07-09                | 256K    | jul 2025 | $3/1M    | $15/1M   | $0.75/1M  |
| `xai/grok/4-fast-wout-reason`   | grok-4-fast-non-reasoning   | 2M      | jul 2025 | $0.20/1M | $0.50/1M | $0.05/1M  |
| `xai/grok/4-fast-with-reason`   | grok-4-fast-reasoning       | 2M      | jul 2025 | $0.20/1M | $0.50/1M | $0.05/1M  |
| `xai/grok/4.1-fast-wout-reason` | grok-4-1-fast-non-reasoning | 2M      | nov 2025 | $0.20/1M | $0.50/1M | $0.05/1M  |
| `xai/grok/4.1-fast-with-reason` | grok-4-1-fast-reasoning     | 2M      | nov 2025 | $0.20/1M | $0.50/1M | $0.05/1M  |

## environment

requires `XAI_API_KEY` environment variable.

## sources

- [xAI API Documentation](https://docs.x.ai/docs/overview)
- [xAI Models](https://docs.x.ai/docs/models)
- [Grok Code Fast 1](https://x.ai/news/grok-code-fast-1)
- [Grok 4](https://x.ai/news/grok-4)
