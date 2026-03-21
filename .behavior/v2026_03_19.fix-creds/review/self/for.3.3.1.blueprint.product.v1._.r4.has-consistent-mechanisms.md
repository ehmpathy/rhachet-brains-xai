# self-review r4: has-consistent-mechanisms

## codebase search results

searched for extant patterns in src/:

| pattern | where found | relevant to blueprint? |
|---------|-------------|----------------------|
| OpenAI client creation | genBrainAtom.ts:74-79 | yes — we extend this |
| `context?.openai` | genBrainAtom.ts:75 | yes — we preserve this |
| `process.env.XAI_API_KEY` | genBrainAtom.ts:77 | yes — we preserve this |
| BadRequestError | test files only | yes — we add to prod code |
| baseURL | genBrainAtom.ts:78 | yes — we reuse same value |

---

## mechanisms in blueprint vs extant

### mechanism 1: OpenAI client creation pattern

| aspect | extant | blueprint |
|--------|--------|-----------|
| pattern | `(context?.openai as OpenAI) ?? new OpenAI({ ... })` | IIFE with precedence chain |
| why different? | blueprint adds creds getter branch |
| is IIFE extant? | no — this is new pattern in this codebase |
| is IIFE problematic? | no — it's idiomatic typescript |

**verdict**: the IIFE pattern is new to this codebase, but it's not duplicate of extant functionality. it's an extension required by rule.require.immutable-vars.

---

### mechanism 2: BadRequestError for absent credentials

| aspect | extant | blueprint |
|--------|--------|-----------|
| where used | test files — `genBrainAtom.integration.test.ts:16` |
| pattern | `throw new BadRequestError('XAI_API_KEY is required...')` |
| blueprint uses | `throw new BadRequestError('XAI_API_KEY required — provide via context or env')` |
| consistent? | yes — same error type, similar message pattern |

**verdict**: consistent with extant pattern. tests already use BadRequestError for absent XAI_API_KEY.

---

### mechanism 3: context type extension

| aspect | extant | blueprint |
|--------|--------|-----------|
| extant type | `context?: Empty` |
| blueprint type | `context?: ContextBrainSupplier<'xai', BrainSuppliesXai> \| Empty` |
| pattern | union type extension |
| reuses extant? | yes — `Empty` preserved in union |

**verdict**: extends extant type, does not duplicate.

---

### mechanism 4: baseURL string

| aspect | analysis |
|--------|----------|
| extant | `baseURL: 'https://api.x.ai/v1'` at line 78 |
| blueprint | same string used in both client creation branches |
| is there a constant? | no — extant code uses inline string |
| should we create a constant? | no — 2 usages, rule.prefer.wet-over-dry says wait for 3+ |

**verdict**: consistent with extant pattern. no duplication concern.

---

### mechanism 5: credential getter type (BrainSuppliesXai)

| aspect | analysis |
|--------|----------|
| extant | no credential getter pattern in this codebase |
| blueprint | `{ creds: () => Promise<{ XAI_API_KEY: string }> }` |
| is this duplicate? | no — this is new functionality |
| is there a utility to reuse? | no — this is the first credential getter |

**verdict**: new mechanism, not duplicate of extant functionality.

---

## issues found

none. each mechanism either:
1. extends extant patterns (client creation, context type)
2. is consistent with extant patterns (BadRequestError, baseURL)
3. is genuinely new functionality (credential getter)

---

## non-issues confirmed

| mechanism | why it holds |
|-----------|-------------|
| IIFE pattern | new to codebase, required by immutable-vars rule |
| BadRequestError | consistent with test file patterns |
| context type union | extends extant type, preserves Empty |
| baseURL string | consistent with extant inline pattern |
| credential getter | genuinely new, no extant utility to reuse |

---

## key insight

**check for extant utilities before you create new ones**

the search revealed that this codebase is small and focused:
- one main file: genBrainAtom.ts
- no credential utilities
- no error handle utilities beyond BadRequestError import

the blueprint adds minimal new mechanisms because extant patterns are reused:
- BadRequestError from helpful-errors (extant import pattern in tests)
- context type union (extends extant Empty pattern)
- baseURL string (reuses extant value)

the only truly new mechanisms are:
- BrainSuppliesXai type — prescribed by vision
- credential getter precedence — prescribed by criteria

---

## open questions for wisher

none. all mechanisms are either consistent with extant patterns or genuinely new as prescribed.

