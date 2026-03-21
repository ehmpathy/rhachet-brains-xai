# self-review r9: has-minimal-surface-area

## surface area check

r9 verifies that the blueprint exposes only what's needed — no extra types, exports, or code paths.

---

## new exports analysis

### export 1: BrainSuppliesXai

| question | answer |
|----------|--------|
| what is it? | type for credential supplier shape |
| who needs it? | consumers who create context with creds getter |
| is it necessary? | yes — consumers must type their context |
| could we avoid export? | no — type must be public for typed context |

**verdict**: necessary. consumers need the type to create typed contexts.

---

## new types analysis

### type 1: BrainSuppliesXai

| question | answer |
|----------|--------|
| properties | `creds: () => Promise<{ XAI_API_KEY: string }>` |
| is every property necessary? | yes — creds getter is the feature |
| could we have fewer properties? | no — this is the minimum |
| could we inline instead? | no — needed for re-export |

**verdict**: minimal. single property, no extras.

### type 2: inline context union

| question | answer |
|----------|--------|
| shape | `{ 'brain.supplier.xai': BrainSuppliesXai } \| Empty` |
| could we simplify? | no — union preserves backwards compat |
| is `Empty` still needed? | yes — for callers who pass no context |

**verdict**: minimal. union is required for backwards compat.

---

## new code paths analysis

### IIFE branches

| branch | when | necessary? |
|--------|------|------------|
| creds getter | `supplier?.creds` present | yes — the feature |
| context.openai | `context?.openai` present | yes — extant path, preserve |
| env fallback | neither present | yes — default for simple use |

**verdict**: exactly 3 branches. all necessary. no dead paths.

---

## what we DON'T add

| potential addition | why omitted |
|--------------------|-------------|
| `genContextBrainSupplier` factory | rhachet's job, not ours |
| credential cache | user's job, we call fresh |
| multiple cred types | YAGNI, one key is enough |
| sync getter variant | async covers all cases |
| error wrapper for getter | propagation is sufficient |

**verdict**: we correctly omit these. vision/criteria don't require them.

---

## code removal check

| extant code | what happens |
|-------------|--------------|
| `context?: Empty` | extended to union, not removed |
| nullish operator client | replaced with IIFE |

we remove zero extant exports. backwards compat preserved.

---

## surface area summary

| category | count | all necessary? |
|----------|-------|----------------|
| new exports | 1 (BrainSuppliesXai) | yes |
| new types | 1 (BrainSuppliesXai) | yes |
| new code paths | 1 (creds branch) | yes |
| preserved paths | 2 (openai, env) | yes |

**total surface area increase: minimal.**

---

## key insight from r9

**we add exactly what's needed, no more**

- 1 type (BrainSuppliesXai) with 1 property (creds)
- 1 export (the type)
- 1 new branch (creds getter)
- 0 removed exports (backwards compat)

the blueprint follows rule.require.pit-of-success via minimum-surface-area.

---

## gaps found

none. surface area is minimal and all additions are necessary.

