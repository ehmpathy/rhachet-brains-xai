# self-review r8: has-clear-execution-path

## execution clarity check

r8 verifies that the blueprint can be executed without ambiguity. every change must be unambiguous.

---

## file: BrainAtom.config.ts

### change: add BrainSuppliesXai type

| question | answer |
|----------|--------|
| where to add? | after extant type exports |
| exact code? | yes — blueprint shows complete type definition |
| depends on extant? | no — standalone type |

```ts
/**
 * .what = supplies for xai brain supplier
 * .why = enables credential injection without plaintext storage
 */
export type BrainSuppliesXai = {
  creds: () => Promise<{ XAI_API_KEY: string }>;
};
```

**verdict**: unambiguous. exact code provided, placement clear.

---

## file: genBrainAtom.ts

### change 1: import BrainSuppliesXai

| question | answer |
|----------|--------|
| where to add? | imports section |
| exact code? | `import type { BrainSuppliesXai } from './BrainAtom.config';` |

**verdict**: unambiguous.

### change 2: re-export BrainSuppliesXai

| question | answer |
|----------|--------|
| where to add? | after extant re-exports |
| exact code? | `export type { BrainSuppliesXai } from './BrainAtom.config';` |

**verdict**: unambiguous.

### change 3: extend context type

| question | answer |
|----------|--------|
| extant type? | `context?: Empty` |
| new type? | `context?: ContextBrainSupplier<'xai', BrainSuppliesXai> \| Empty` |
| how to express ContextBrainSupplier? | inline: `{ 'brain.supplier.xai': BrainSuppliesXai }` |

**clarification needed**: blueprint mentions `ContextBrainSupplier` from rhachet, but rhachet doesn't have it yet. we must inline the type shape.

**resolution**: use inline type `{ 'brain.supplier.xai': BrainSuppliesXai }` directly in union.

```ts
context?: { 'brain.supplier.xai': BrainSuppliesXai } | Empty
```

**verdict**: unambiguous after clarification.

### change 4: update openai client creation

| question | answer |
|----------|--------|
| extant code location? | lines 74-79 |
| new code? | yes — blueprint shows complete IIFE |
| replace or insert? | replace extant client creation block |

**extant**:
```ts
const openai = (context?.openai as OpenAI | undefined) ??
  new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  });
```

**new**:
```ts
const openai: OpenAI = await (async () => {
  const supplier = context?.['brain.supplier.xai'];
  if (supplier?.creds) {
    const creds = await supplier.creds();
    return new OpenAI({
      apiKey: creds.XAI_API_KEY,
      baseURL: 'https://api.x.ai/v1',
    });
  }
  if (context?.openai) {
    return context.openai as OpenAI;
  }
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new BadRequestError('XAI_API_KEY required — provide via context or env');
  }
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });
})();
```

**verdict**: unambiguous. exact replacement code provided.

### change 5: add BadRequestError import

| question | answer |
|----------|--------|
| extant import? | check if helpful-errors already imported |
| if not, add | `import { BadRequestError } from 'helpful-errors';` |

**verdict**: unambiguous. conditional add if absent.

---

## file: sdk/index.ts

### change: export BrainSuppliesXai

| question | answer |
|----------|--------|
| where to add? | after extant exports |
| exact code? | `export { BrainSuppliesXai } from '../domain.operations/atom/genBrainAtom';` |

**verdict**: unambiguous.

---

## file: genBrainAtom.credentials.integration.test.ts (new)

### content

| question | answer |
|----------|--------|
| location? | `src/domain.operations/atom/` |
| test cases? | 4 cases listed in blueprint |
| test style? | given/when/then from test-fns |

**gap**: blueprint lists test cases but not exact test code.

**resolution**: test code will follow extant test patterns in `genBrainAtom.integration.test.ts`. cases are:
1. context with creds getter succeeds
2. getter called fresh per ask (call count check)
3. getter error propagates
4. multi-tenant isolation

**verdict**: clear enough. follow extant test patterns.

---

## file: README.md

### content

| question | answer |
|----------|--------|
| section to add? | "credential supplier" |
| usecases? | 4 usecases from vision |
| cache recommendation? | with-simple-cache + simple-in-memory-cache |

**gap**: blueprint says "add section" but not exact location or full text.

**resolution**: add after extant usage section. content follows vision documentation requirements.

**verdict**: clear enough. content prescribed by vision.

---

## ambiguity summary

| file | change | ambiguous? | resolution |
|------|--------|------------|------------|
| BrainAtom.config.ts | add type | no | |
| genBrainAtom.ts | import | no | |
| genBrainAtom.ts | re-export | no | |
| genBrainAtom.ts | context type | yes → no | inline type, not import |
| genBrainAtom.ts | IIFE | no | exact code provided |
| genBrainAtom.ts | BadRequestError | no | conditional add |
| sdk/index.ts | export | no | |
| test file | new file | minor | follow extant patterns |
| README.md | new section | minor | follow vision |

---

## key insight from r8

**one clarification needed**: the blueprint assumes `ContextBrainSupplier` is available from rhachet, but it isn't yet. we must inline the type shape.

this is consistent with r5's result: "first mover defines the pattern". we inline the shape now; rhachet will extract it later.

---

## execution path is clear

all changes can be executed unambiguously:
1. add `BrainSuppliesXai` type to BrainAtom.config.ts
2. import and re-export in genBrainAtom.ts
3. extend context type with inline shape
4. replace client creation with IIFE
5. add BadRequestError import if absent
6. export from sdk/index.ts
7. write test file with 4 cases
8. update README with credential supplier section

