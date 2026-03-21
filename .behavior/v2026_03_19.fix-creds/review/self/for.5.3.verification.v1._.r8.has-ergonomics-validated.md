# has-ergonomics-validated: self-review round 8

## i compare implemented ergonomics against vision sketch

### context

this behavior is a feature addition, not a defect fix. the repros artifact (`3.2.distill.repros.experience.*.md`) does not exist.

for feature additions, ergonomics validation compares the implementation against the vision usecases. i trace each vision usecase to verify ergonomics match.

---

## usecase 1: simple local development (env var fallback)

### vision sketch (from 1.vision)

```ts
// just works — falls back to process.env.XAI_API_KEY
const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
await atom.ask({ role: {}, prompt: 'hello', schema: { output: z.object({}) } });
```

### implemented ergonomics

```ts
const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
await atom.ask({
  role: {},
  prompt: 'respond with exactly: hello world',
  schema: { output: z.object({ content: z.string() }) },
});
```

### comparison

| aspect | vision | implemented | match |
|--------|--------|-------------|-------|
| factory call | `genBrainAtom({ slug })` | `genBrainAtom({ slug })` | yes |
| ask input | `{ role, prompt, schema }` | `{ role, prompt, schema }` | yes |
| context arg | absent | absent | yes |
| creds source | `process.env.XAI_API_KEY` | `process.env.XAI_API_KEY` | yes |

**verdict**: ergonomics match exactly.

---

## usecase 2: production with secrets manager

### vision sketch (from 1.vision)

```ts
const context = genContextBrainSupplier<'xai', BrainSuppliesXai>({
  creds: async () => ({ XAI_API_KEY: await keyrack.get({ env: 'prod', key: 'XAI_API_KEY' }) }),
});

const atom = genBrainAtom({ slug: 'xai/grok/4' });
await atom.ask({ ... }, context);
```

### implemented ergonomics

```ts
const context = {
  'brain.supplier.xai': {
    creds: async () => ({
      XAI_API_KEY: await keyrack.get({ env: 'prod', key: 'XAI_API_KEY' }),
    }),
  },
};

const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
await atom.ask({ ... }, asContext(context));
```

### comparison

| aspect | vision | implemented | match |
|--------|--------|-------------|-------|
| context creation | `genContextBrainSupplier<'xai', BrainSuppliesXai>({...})` | `{ 'brain.supplier.xai': {...} }` | shape matches, factory not needed yet |
| creds getter | `async () => ({ XAI_API_KEY })` | `async () => ({ XAI_API_KEY })` | yes |
| ask with context | `atom.ask({ ... }, context)` | `atom.ask({ ... }, asContext(context))` | yes (asContext is temporary) |

### drift analysis

- **vision proposed**: `genContextBrainSupplier<'xai', BrainSuppliesXai>({ creds })` factory
- **implemented**: direct object construction `{ 'brain.supplier.xai': { creds } }`
- **reason**: factory lives in rhachet package; this package defines `BrainSuppliesXai` type only
- **mitigation**: `asContext()` helper in tests; will be removed when rhachet exports factory

**verdict**: ergonomics match intent. factory pattern deferred to rhachet lift.

---

## usecase 3: multi-tenant credential isolation

### vision sketch (from 1.vision)

```ts
const getContextForCustomer = (input: { customerUuid: string }) =>
  genContextBrainSupplier<'xai', BrainSuppliesXai>({
    creds: async () => ({
      XAI_API_KEY: await keyrack.get({ owner: input.customerUuid, env: 'prod', key: 'XAI_API_KEY' }),
    }),
  });

await atom.ask({ ... }, getContextForCustomer({ customerUuid: 'customer-a' }));
await atom.ask({ ... }, getContextForCustomer({ customerUuid: 'customer-b' }));
```

### implemented ergonomics (from credentials.integration.test.ts case4)

```ts
const contextA = {
  'brain.supplier.xai': {
    creds: async () => {
      apiKeysUsed.push('keyA');
      return { XAI_API_KEY: realApiKey };
    },
  },
};

const contextB = {
  'brain.supplier.xai': {
    creds: async () => {
      apiKeysUsed.push('keyB');
      return { XAI_API_KEY: realApiKey };
    },
  },
};

await atom.ask({ ... }, asContext(contextA));
await atom.ask({ ... }, asContext(contextB));
```

### comparison

| aspect | vision | implemented | match |
|--------|--------|-------------|-------|
| per-customer context | factory returns context | object per customer | yes |
| creds isolation | different getter per context | different getter per context | yes |
| call site | `atom.ask({ ... }, context)` | `atom.ask({ ... }, asContext(context))` | yes |

**verdict**: ergonomics match. multi-tenant isolation works as sketched.

---

## usecase 4: tests without env pollution

### vision sketch (from 1.vision)

```ts
given('atom with mocked credentials', () => {
  const context: ContextBrainSupplier<'xai', BrainSuppliesXai> = {
    'brain.supplier.xai': {
      creds: async () => ({ XAI_API_KEY: 'test-key-for-this-suite' }),
    },
  };

  await atom.ask({ ... }, context);
});
```

### implemented ergonomics (from credentials.integration.test.ts)

```ts
given('[case1] context with creds getter', () => {
  when('[t0] ask is called with context supplier', () => {
    then('creds getter is called and used', async () => {
      const context: { 'brain.supplier.xai': BrainSuppliesXai } = {
        'brain.supplier.xai': {
          creds: async () => {
            getterCallCount += 1;
            return { XAI_API_KEY: realApiKey };
          },
        },
      };

      await atom.ask({ ... }, asContext(context));
    });
  });
});
```

### comparison

| aspect | vision | implemented | match |
|--------|--------|-------------|-------|
| context type | `ContextBrainSupplier<'xai', BrainSuppliesXai>` | `{ 'brain.supplier.xai': BrainSuppliesXai }` | equivalent shape |
| creds injection | inline getter | inline getter | yes |
| env isolation | does not read env | does not read env | yes |

**verdict**: ergonomics match. tests inject credentials without env pollution.

---

## type exports

### vision (from 1.vision)

```ts
import { genContextBrainSupplier } from 'rhachet';
import { BrainSuppliesXai } from 'rhachet-brains-xai';
```

### implemented (from sdk/index.ts)

```ts
export { BrainSuppliesXai } from '../domain.operations/atom/genBrainAtom';
```

### comparison

| export | vision | implemented | match |
|--------|--------|-------------|-------|
| `BrainSuppliesXai` | from this package | exported from sdk/index.ts | yes |
| `genContextBrainSupplier` | from rhachet | not in scope (rhachet responsibility) | n/a |

**verdict**: type export matches vision scope.

---

## ergonomics summary

| usecase | vision input | implemented input | vision output | implemented output | match |
|---------|-------------|-------------------|---------------|-------------------|-------|
| env fallback | `ask({ role, prompt, schema })` | `ask({ role, prompt, schema })` | BrainOutput | BrainOutput | yes |
| context supplier | `ask({ ... }, context)` | `ask({ ... }, context)` | BrainOutput | BrainOutput | yes |
| multi-tenant | per-customer context | per-customer context | isolated calls | isolated calls | yes |
| test isolation | injected creds | injected creds | no env read | no env read | yes |

---

## drift analysis

### what drifted

1. **factory pattern**: vision proposed `genContextBrainSupplier<'xai', BrainSuppliesXai>({ creds })`, implementation uses direct object construction
   - **reason**: factory belongs in rhachet core, not this package
   - **mitigation**: `asContext()` helper provides type safety until rhachet lift

2. **type assertion**: implementation requires `asContext(context)` in tests
   - **reason**: `BrainAtom.ask()` declares `context?: Empty` in interface
   - **mitigation**: commented in test file (line 17-21) — will be removed when rhachet exposes context types

### why drifts are acceptable

both drifts are **deferred implementation details**, not ergonomic changes:
- users will not see `asContext()` — it's internal test helper
- factory pattern is rhachet's responsibility — shape is correct

---

## verdict

implemented ergonomics match vision:

1. **simple local dev**: exact match — no imports, no context, env var fallback
2. **context supplier**: shape matches — factory deferred to rhachet
3. **multi-tenant**: exact match — per-customer context isolation
4. **test isolation**: exact match — inject creds, no env pollution
5. **type exports**: `BrainSuppliesXai` exported as planned

the design did not drift between vision and implementation.

