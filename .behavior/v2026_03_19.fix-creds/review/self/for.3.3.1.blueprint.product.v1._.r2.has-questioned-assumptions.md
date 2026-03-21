# self-review r2: has-questioned-assumptions

## assumptions questioned

### assumption 1: OpenAI client creation is cheap

| question | answer |
|----------|--------|
| what do we assume without evidence? | `new OpenAI({ apiKey, baseURL })` is cheap to create |
| what if the opposite were true? | each ask() would incur overhead |
| evidence or habit? | extant code already does this per ask() |
| exceptions or counterexamples? | none known |
| could a simpler approach work? | reuse client if same apiKey |

**why it holds**: extant code at `genBrainAtom.ts:74-79` already creates a new OpenAI client per ask() if not in context. this has been in production. if it were expensive, we'd know.

**action**: keep current design. if performance becomes an issue, users can pass `context.openai` to reuse a client.

---

### assumption 2: ContextBrainSupplier will be lifted to rhachet

| question | answer |
|----------|--------|
| what do we assume without evidence? | rhachet will eventually have `genContextBrainSupplier` |
| what if the opposite were true? | we'd need to provide the factory ourselves |
| evidence or habit? | wisher stated this in vision |
| exceptions or counterexamples? | rhachet may never add this |
| could a simpler approach work? | inline type definition works now |

**why it holds**: vision explicitly states this is the plan. we use compatible shape now. if rhachet never adds the factory, consumers can still use the type directly:

```ts
const context: ContextBrainSupplier<'xai', BrainSuppliesXai> = {
  'brain.supplier.xai': { creds: async () => ({ ... }) },
};
```

**action**: no change needed. design works with or without rhachet factory.

---

### assumption 3: getter called fresh per ask (not cached)

| question | answer |
|----------|--------|
| what do we assume without evidence? | users want fresh credentials per ask() |
| what if the opposite were true? | users would want cached credentials |
| evidence or habit? | wisher answered: always fresh, user controls cache |
| exceptions or counterexamples? | high-frequency calls would hammer vault |
| could a simpler approach work? | cache by default? |

**why it holds**: wisher explicitly answered this in vision. fresh-per-ask enables credential rotation. users who want cache wrap their getter with `withSimpleCache`. this keeps our implementation simple and gives users control.

**action**: no change needed. document cache recommendation in README.

---

### assumption 4: namespace `brain.supplier.xai` is correct

| question | answer |
|----------|--------|
| what do we assume without evidence? | this namespace won't collide |
| what if the opposite were true? | could conflict with other context keys |
| evidence or habit? | wisher specified this pattern |
| exceptions or counterexamples? | none in this repo |
| could a simpler approach work? | shorter key like `xai.creds` |

**why it holds**: wisher specified the pattern `ContextBrainSupplier<TSlug, TSupplies>` = `{ ['brain.supplier.' + TSlug]: TSupplies }`. this is verbose but unambiguous. vision explicitly chose this over shorter alternatives to avoid collision.

**action**: no change needed.

---

### assumption 5: one credential (XAI_API_KEY) is sufficient

| question | answer |
|----------|--------|
| what do we assume without evidence? | xAI only needs one API key |
| what if the opposite were true? | we'd need to expand BrainSuppliesXai |
| evidence or habit? | xAI docs show single API key |
| exceptions or counterexamples? | some APIs need org ID, project ID |
| could a simpler approach work? | n/a |

**why it holds**: xAI API currently uses a single API key. the type is:

```ts
type BrainSuppliesXai = {
  creds: () => Promise<{ XAI_API_KEY: string }>;
};
```

if xAI adds more credentials later, we extend the return type. the getter pattern accommodates this without contract breaks.

**action**: no change needed. design is extensible.

---

### assumption 6: `let openai` mutation pattern is acceptable

| question | answer |
|----------|--------|
| what do we assume without evidence? | mutation within function scope is fine |
| what if the opposite were true? | we'd use IIFE or refactor to const |
| evidence or habit? | habit — many codebases do this |
| exceptions or counterexamples? | rule.require.immutable-vars says forbid let |
| could a simpler approach work? | yes — use IIFE to return const |

**decision**: ISSUE FOUND. the blueprint shows `let openai: OpenAI` which violates `rule.require.immutable-vars`. we must refactor to use const via IIFE.

---

### assumption 7: BadRequestError is correct for absent credentials

| question | answer |
|----------|--------|
| what do we assume without evidence? | absent env var is a "bad request" |
| what if the opposite were true? | it could be ConfigurationError |
| evidence or habit? | criteria says "throw clear error" |
| exceptions or counterexamples? | BadRequestError is for invalid user input |
| could a simpler approach work? | use the same error type |

**why it holds**: the criteria says "throw clear error if XAI_API_KEY env var is absent sothat developers know exactly what's needed". BadRequestError signals "you need to fix this" which is appropriate. the error message is the important part: "XAI_API_KEY required — provide via context or env".

**action**: keep BadRequestError. the message clarity matters more than the error class.

---

### assumption 8: context type union is correct

| question | answer |
|----------|--------|
| what do we assume without evidence? | `ContextBrainSupplier<'xai', BrainSuppliesXai> \| Empty` is the right union |
| what if the opposite were true? | we'd need a different type |
| evidence or habit? | extant code uses `Empty` |
| exceptions or counterexamples? | could we use optional properties instead? |
| could a simpler approach work? | yes — make context optional with proper types |

**why it holds**: the union allows both:
- `ContextBrainSupplier<'xai', BrainSuppliesXai>` — credential supplier context
- `Empty` — no properties (env var fallback)
- `undefined` — not provided (via `?`)

this matches the extant pattern and maintains backwards compatibility.

**action**: keep current type union.

---

## issues found and how they were fixed

### issue 1: `let openai` violates immutable-vars rule

**before**: blueprint shows `let openai: OpenAI;` followed by conditional assignment.

**problem**: `rule.require.immutable-vars` says "use const for all bindings; forbid let or var". the `let` mutation pattern is a blocker.

**how fixed**: refactor to use IIFE that returns const:

```ts
// get openai client with precedence: creds getter > context.openai > env var
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

**verification**: updated blueprint implementation detail to use const + IIFE pattern.

---

## non-issues confirmed

7 of 8 assumptions verified; 1 issue found and fixed:

1. **OpenAI client cheap**: extant code proves this works
2. **rhachet lift**: design works with or without rhachet factory
3. **fresh-per-ask**: wisher answered; users control cache
4. **namespace**: wisher specified; vision documented tradeoffs
5. **single credential**: xAI API uses one key; design is extensible
6. **`let openai` mutation**: ISSUE — refactored to const + IIFE
7. **BadRequestError for absent creds**: appropriate for "you need to fix this" scenario
8. **context type union**: matches extant pattern, maintains backwards compat

**why this holds**: each assumption either traces to evidence (wisher answers, extant code, docs) or was fixed when found to violate rules.

---

## key insights from this review

### insight 1: habit vs evidence

the `let openai` pattern felt natural because "many codebases do this". but the repo has `rule.require.immutable-vars`. this is a reminder: what feels normal may not match the project's constraints. always check rules before defaulting to habits.

### insight 2: the IIFE pattern for const

the fix shows how to achieve conditional const assignment via IIFE:

```ts
const x = await (async () => {
  if (condition) return valueA;
  return valueB;
})();
```

this pattern:
- satisfies immutable-vars rule
- keeps early returns for readability
- avoids nested ternaries

worth internalizing for future blueprints.

### insight 3: assumptions with wisher backing are stable

assumptions 3 (fresh-per-ask) and 4 (namespace) were both wisher-answered. these required no changes because the wisher already thought through the tradeoffs. when reviewing blueprints, prioritize questioning assumptions that lack wisher backing.

### insight 4: extensibility as defensive design

assumption 5 (single credential) could have been fragile. but the getter pattern `() => Promise<{ XAI_API_KEY: string }>` is extensible:

```ts
// today
() => Promise<{ XAI_API_KEY: string }>

// future if xAI adds org ID
() => Promise<{ XAI_API_KEY: string; XAI_ORG_ID: string }>
```

backwards compatible extension. good defensive design reduces future review burden.

---

## what to watch for next time

1. check `rule.require.immutable-vars` before using `let`
2. look for "habit vs evidence" red flags
3. prioritize reviewing assumptions without wisher backing
4. verify extensibility paths for type definitions

