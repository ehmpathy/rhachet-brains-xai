# has-pruned-backcompat: self-review for 5.1.execution

## review checklist

for each backwards-compat concern:
- did the wisher explicitly say to maintain this compatibility?
- is there evidence this backwards compat is needed?
- or did we assume it "to be safe"?

---

## backwards-compat concerns reviewed

### env var fallback

**concern**: when no context supplier is provided, fall back to `process.env.XAI_API_KEY`

| question | answer |
|----------|--------|
| wisher explicitly requested? | yes |
| evidence | vision section "evaluation > pros" states: "zero break changes: env var fallback preserves backwards compat" |
| assumed "to be safe"? | no — explicitly prescribed |

**implementation verification**:

```ts
// getSdkXaiCreds.ts lines 27-34
// fallback to env var
const apiKey = process.env.XAI_API_KEY;
if (!apiKey) {
  throw new BadRequestError(
    'XAI_API_KEY required — provide via context or env',
  );
}
return { XAI_API_KEY: apiKey };
```

**verdict**: holds ✓ — explicitly requested, correctly implemented

---

### optional context parameter

**concern**: context parameter remains optional in `ask()` signature

| question | answer |
|----------|--------|
| wisher explicitly requested? | yes |
| evidence | vision usecase 1 "simple local development": "just works — falls back to process.env.XAI_API_KEY" |
| assumed "to be safe"? | no — part of prescribed usecase |

**implementation verification**:

```ts
// genBrainAtom.ts line 67
context?: { 'brain.supplier.xai'?: BrainSuppliesXai },
```

**verdict**: holds ✓ — explicitly requested via usecase

---

## summary

| backwards-compat concern | status | reason |
|--------------------------|--------|--------|
| env var fallback | ✓ explicitly requested | vision evaluation section |
| optional context | ✓ explicitly requested | vision usecase 1 |

**conclusion**: all backwards-compat behavior was explicitly requested in the vision. no assumed compatibility found.
