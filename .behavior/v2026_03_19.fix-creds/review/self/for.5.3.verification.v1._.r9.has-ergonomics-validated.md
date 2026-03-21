# has-ergonomics-validated: self-review round 9

## i validate ergonomics by direct code comparison against vision

### context

this behavior is a feature addition, not a defect fix. the repros artifact (`3.2.distill.repros.experience.*.md`) does not exist.

for feature additions, ergonomics validation compares implementation against vision usecases. i trace each vision sketch line-by-line against actual code.

---

## vision usecase 1: simple local development

### vision sketch

```ts
const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
await atom.ask({ role: {}, prompt: 'hello', schema: { output: z.object({}) } });
```

### i trace the implementation

**step 1: genBrainAtom factory**

genBrainAtom.ts line 43:
```ts
export const genBrainAtom = (input: { slug: XaiBrainAtomSlug }): BrainAtom => {
```

- accepts `{ slug }` — matches vision
- returns `BrainAtom` — matches vision

**step 2: ask() signature**

genBrainAtom.ts lines 59-68:
```ts
ask: async <TOutput, TPlugs extends BrainPlugs = BrainPlugs>(
  askInput: {
    on?: { episode: BrainEpisode };
    plugs?: TPlugs;
    role: { briefs?: Artifact<typeof GitFile>[] };
    prompt: string | BrainPlugToolExecution[];
    schema: { output: z.Schema<TOutput> };
  },
  context?: { 'brain.supplier.xai'?: BrainSuppliesXai },
): Promise<BrainOutput<TOutput, 'atom', TPlugs>> => {
```

- `role` is required (line 63) — matches vision `role: {}`
- `prompt` accepts string (line 64) — matches vision `prompt: 'hello'`
- `schema.output` accepts z.Schema (line 65) — matches vision `schema: { output: z.object({}) }`
- `context` is optional (line 67) — vision omits it = match

**step 3: credential fallback**

genBrainAtom.ts line 78:
```ts
const creds = await getSdkXaiCreds({}, context);
```

getSdkXaiCreds.ts lines 27-34:
```ts
const apiKey = process.env.XAI_API_KEY;
if (!apiKey) {
  throw new BadRequestError(
    'XAI_API_KEY required — provide via context or env',
  );
}
return { XAI_API_KEY: apiKey };
```

- reads `process.env.XAI_API_KEY` when no context — matches vision
- error message guides user — matches vision "clear error" requirement

### verdict for usecase 1

| aspect | vision | implementation | line | match |
|--------|--------|----------------|------|-------|
| factory input | `{ slug }` | `{ slug: XaiBrainAtomSlug }` | 43 | yes |
| ask input | `{ role, prompt, schema }` | `{ role, prompt, schema, ...optional }` | 59-65 | yes |
| context | absent | optional | 67 | yes |
| creds source | `process.env.XAI_API_KEY` | `process.env.XAI_API_KEY` | 28 | yes |

**ergonomics match**: zero-import, zero-context development path works as sketched.

---

## vision usecase 2: production with secrets manager

### vision sketch

```ts
const context = genContextBrainSupplier<'xai', BrainSuppliesXai>({
  creds: async () => ({ XAI_API_KEY: await keyrack.get({...}) }),
});

await atom.ask({ ... }, context);
```

### i trace the implementation

**step 1: BrainSuppliesXai type**

BrainAtom.config.ts lines 18-20:
```ts
export type BrainSuppliesXai = {
  creds: () => Promise<{ XAI_API_KEY: string }>;
};
```

- `creds` is async getter — matches vision
- returns `{ XAI_API_KEY: string }` — matches vision

**step 2: context shape**

genBrainAtom.ts line 67:
```ts
context?: { 'brain.supplier.xai'?: BrainSuppliesXai },
```

- key is `'brain.supplier.xai'` — matches vision's template literal `brain.supplier.${slug}`
- value is `BrainSuppliesXai` — matches vision

**step 3: getter invocation**

getSdkXaiCreds.ts lines 15-24:
```ts
const supplier = context?.['brain.supplier.xai'];

if (supplier?.creds) {
  const creds = await supplier.creds();
  return {
    XAI_API_KEY:
      creds?.XAI_API_KEY ??
      BadRequestError.throw('creds getter returned undefined XAI_API_KEY'),
  };
}
```

- extracts supplier from context (line 15)
- calls getter (line 19)
- returns credentials (line 21-24)

**step 4: factory pattern**

vision proposed `genContextBrainSupplier<'xai', BrainSuppliesXai>({ creds })`.

implementation uses direct object construction:
```ts
const context = {
  'brain.supplier.xai': {
    creds: async () => ({ XAI_API_KEY: '...' }),
  },
};
```

**drift**: factory not implemented in this package.

**why acceptable**:
- factory belongs in rhachet core (see 1.vision "note = lives in _topublish/rhachet/")
- shape is identical to what factory would produce
- type safety preserved via `BrainSuppliesXai`

### verdict for usecase 2

| aspect | vision | implementation | line | match |
|--------|--------|----------------|------|-------|
| creds type | `() => Promise<{ XAI_API_KEY }>` | `() => Promise<{ XAI_API_KEY: string }>` | 19 | yes |
| context key | `brain.supplier.xai` | `'brain.supplier.xai'` | 67 | yes |
| getter call | `await creds()` | `await supplier.creds()` | 19 | yes |
| factory | `genContextBrainSupplier<...>` | direct object | - | deferred |

**ergonomics match**: shape is correct; factory deferred to rhachet lift.

---

## vision usecase 3: multi-tenant isolation

### vision sketch

```ts
const getContextForCustomer = (input: { customerUuid: string }) =>
  genContextBrainSupplier<'xai', BrainSuppliesXai>({
    creds: async () => ({
      XAI_API_KEY: await keyrack.get({ owner: input.customerUuid, ... }),
    }),
  });

await atom.ask({ ... }, getContextForCustomer({ customerUuid: 'customer-a' }));
await atom.ask({ ... }, getContextForCustomer({ customerUuid: 'customer-b' }));
```

### i trace the implementation

**step 1: per-customer context**

credentials.integration.test.ts lines 137-153:
```ts
const contextA: { 'brain.supplier.xai': BrainSuppliesXai } = {
  'brain.supplier.xai': {
    creds: async () => {
      apiKeysUsed.push('keyA');
      return { XAI_API_KEY: realApiKey };
    },
  },
};

const contextB: { 'brain.supplier.xai': BrainSuppliesXai } = {
  'brain.supplier.xai': {
    creds: async () => {
      apiKeysUsed.push('keyB');
      return { XAI_API_KEY: realApiKey };
    },
  },
};
```

- each context is independent object — matches vision
- each getter can return different creds — matches vision

**step 2: isolation verified**

credentials.integration.test.ts lines 158-175:
```ts
await atom.ask({ ... }, asContext(contextA));
await atom.ask({ ... }, asContext(contextB));

expect(apiKeysUsed).toEqual(['keyA', 'keyB']);
```

- contextA getter called for first ask — matches vision
- contextB getter called for second ask — matches vision
- no cross-contamination — matches vision

### verdict for usecase 3

| aspect | vision | implementation | line | match |
|--------|--------|----------------|------|-------|
| per-customer context | factory per customer | object per customer | 137-153 | yes |
| isolation | separate getters | separate getters | 140, 149 | yes |
| verification | - | `apiKeysUsed.toEqual(['keyA', 'keyB'])` | 177 | proven |

**ergonomics match**: multi-tenant isolation works as sketched.

---

## vision usecase 4: tests without env pollution

### vision sketch

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

### i trace the implementation

**step 1: context type in tests**

credentials.integration.test.ts lines 33-40:
```ts
const context: { 'brain.supplier.xai': BrainSuppliesXai } = {
  'brain.supplier.xai': {
    creds: async () => {
      getterCallCount += 1;
      return { XAI_API_KEY: realApiKey };
    },
  },
};
```

- type annotation `{ 'brain.supplier.xai': BrainSuppliesXai }` — matches vision's `ContextBrainSupplier<'xai', BrainSuppliesXai>`
- inline getter — matches vision

**step 2: no env pollution**

getSdkXaiCreds.ts lines 18-24:
```ts
if (supplier?.creds) {
  const creds = await supplier.creds();
  return {
    XAI_API_KEY: creds?.XAI_API_KEY ?? ...
  };
}
// fallback block never reached when supplier present
```

- when supplier present, env fallback is skipped — matches vision requirement

### verdict for usecase 4

| aspect | vision | implementation | line | match |
|--------|--------|----------------|------|-------|
| context type | `ContextBrainSupplier<'xai', BrainSuppliesXai>` | `{ 'brain.supplier.xai': BrainSuppliesXai }` | 33 | equivalent |
| inline getter | yes | yes | 35-38 | yes |
| env bypass | does not read env | exits before fallback | 24 | yes |

**ergonomics match**: tests inject credentials without env pollution.

---

## type exports

### vision

```ts
import { genContextBrainSupplier } from 'rhachet';
import { BrainSuppliesXai } from 'rhachet-brains-xai';
```

### implementation

sdk/index.ts lines 23-26:
```ts
export {
  type BrainSuppliesXai,
  genBrainAtom,
} from '@src/domain.operations/atom/genBrainAtom';
```

| export | vision | implementation | match |
|--------|--------|----------------|-------|
| `BrainSuppliesXai` | from this package | exported line 24 | yes |
| `genBrainAtom` | from this package | exported line 25 | yes |
| `genContextBrainSupplier` | from rhachet | not in scope | n/a |

---

## drift summary

| drift | reason | acceptable |
|-------|--------|------------|
| factory `genContextBrainSupplier` not implemented | belongs in rhachet | yes |
| `asContext()` helper in tests | `BrainAtom.ask()` declares `context?: Empty` | yes, documented as temporary |

both drifts are deferred implementation details with documented mitigation paths.

---

## verdict

implemented ergonomics match vision:

1. **simple local dev**: factory `genBrainAtom({ slug })`, ask without context, env fallback
2. **context supplier**: `{ 'brain.supplier.xai': { creds } }` shape, async getter
3. **multi-tenant**: per-customer context objects, isolated getters
4. **test isolation**: inline getter, env bypass

all input/output shapes match vision sketches. factory pattern deferred to rhachet lift with no user-visible impact.

