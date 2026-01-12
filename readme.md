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
const brainAtom = genBrainAtom({ slug: 'xai/grok-code-fast-1' });

// simple string output
const explanation = await brainAtom.ask({
  role: { briefs: [] },
  prompt: 'explain this code',
  schema: { output: z.string() },
});

// structured object output
const { summary, issues } = await brainAtom.ask({
  role: { briefs: [] },
  prompt: 'analyze this code',
  schema: { output: z.object({ summary: z.string(), issues: z.array(z.string()) }) },
});
```

## available brains

### atoms (via genBrainAtom)

stateless inference without tool use.

| slug                   | model                  | context | description                        |
| ---------------------- | ---------------------- | ------- | ---------------------------------- |
| `xai/grok-code-fast-1` | grok-code-fast-1       | 256K    | optimized for agentic code tasks   |
| `xai/grok-3`           | grok-3-beta            | 131K    | balanced logic model               |
| `xai/grok-3-mini`      | grok-3-mini-beta       | 131K    | fast and cost-effective            |
| `xai/grok-4`           | grok-4-07-09           | 256K    | advanced logic model               |
| `xai/grok-4-fast`      | grok-4-fast-reasoning  | 2M      | frontier model with tool use       |

## environment

requires `XAI_API_KEY` environment variable.

## sources

- [xAI API Documentation](https://docs.x.ai/docs/overview)
- [xAI Models](https://docs.x.ai/docs/models)
- [Grok Code Fast 1](https://x.ai/news/grok-code-fast-1)
