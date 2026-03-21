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

requires `XAI_API_KEY` via environment variable or context supplier.

### env var (simple)

```sh
export XAI_API_KEY=your-api-key
```

### context supplier (secure)

for production, inject credentials via context supplier to avoid plaintext storage:

```ts
import { genContextBrainSupplier } from 'rhachet';
import { genBrainAtom, type BrainSuppliesXai } from 'rhachet-brains-xai';

// create context with async creds getter
const context = genContextBrainSupplier<'xai', BrainSuppliesXai>('xai', {
  creds: async () => ({
    XAI_API_KEY: await yourSecretsManager.get('XAI_API_KEY'),
  }),
});

// pass context to ask()
const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
const result = await atom.ask(
  {
    role: {},
    prompt: 'hello',
    schema: { output: z.object({ message: z.string() }) },
  },
  context,
);
```

benefits:
- credentials fetched just-in-time
- credentials never stored in memory as plaintext
- credentials can be rotated without restart
- credentials scoped to specific operations
- fallback to env var when context not provided

### multi-tenant isolation

different contexts enable different credentials per call:

```ts
import { genContextBrainSupplier } from 'rhachet';
import { type BrainSuppliesXai } from 'rhachet-brains-xai';

const getContextForCustomer = (input: { customerId: string }) =>
  genContextBrainSupplier<'xai', BrainSuppliesXai>('xai', {
    creds: async () => ({
      XAI_API_KEY: await keyrack.get({ owner: input.customerId, key: 'XAI_API_KEY' }),
    }),
  });

// customer A uses their credentials
await atom.ask({ ... }, getContextForCustomer({ customerId: 'customer-a' }));

// customer B uses their credentials
await atom.ask({ ... }, getContextForCustomer({ customerId: 'customer-b' }));
```

### credential cache

the getter is called fresh per `ask()`. for high-frequency usage, cache with `with-simple-cache`:

```ts
import { genContextBrainSupplier } from 'rhachet';
import { type BrainSuppliesXai } from 'rhachet-brains-xai';
import { createCache } from 'simple-in-memory-cache';
import { withSimpleCache } from 'with-simple-cache';

const cache = createCache();
const getXaiCreds = withSimpleCache(
  async () => ({ XAI_API_KEY: await yourSecretsManager.get('XAI_API_KEY') }),
  { cache },
);

const context = genContextBrainSupplier<'xai', BrainSuppliesXai>('xai', {
  creds: getXaiCreds,
});
```

## sources

- [xAI API Documentation](https://docs.x.ai/docs/overview)
- [xAI Models](https://docs.x.ai/docs/models)
- [Grok Code Fast 1](https://x.ai/news/grok-code-fast-1)
- [Grok 4](https://x.ai/news/grok-4)
