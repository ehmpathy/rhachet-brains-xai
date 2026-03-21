# self-review r8: has-behavior-declaration-coverage (deeper)

## deeper articulation

r7 found 1 issue and fixed it. r8 articulates the fix and verifies the rest of coverage holds.

---

## issue found in r7

### the gap

vision's pit of success table says:
> "getter returns undefined — treat as absent, fall back to env"

but this conflicts with the type contract:
```ts
type BrainSuppliesXai = {
  creds: () => Promise<{ XAI_API_KEY: string }>;
};
```

the getter promises `{ XAI_API_KEY: string }`, not `{ XAI_API_KEY: string | undefined }`.

### the resolution

**human feedback**: "failfast instead. that'd be a runtime type violation"

if the getter returns undefined, the caller violated the type contract. we fail fast:

```ts
apiKey: creds?.XAI_API_KEY ?? BadRequestError.throw('creds getter returned undefined XAI_API_KEY')
```

### why this is correct

1. **type contract enforcement** — the getter promises a string, not undefined
2. **fail fast principle** — expose violations at point of failure
3. **clear error message** — "creds getter returned undefined" tells user exactly what went wrong
4. **no silent degradation** — don't fall back to env when context was explicitly provided

### what i learned

> when vision's pit of success conflicts with type contract, type contract wins.

the vision was written before type contract was finalized. the type contract is more precise.

---

## why the rest of coverage holds

### vision requirement 1: getter pattern

| requirement | why it holds |
|-------------|--------------|
| `creds: () => Promise<{ XAI_API_KEY: string }>` | BrainSuppliesXai type matches exactly |

**articulation**: the type declaration in blueprint line 90 shows exact match. no divergence.

---

### vision requirement 2: context injection

| requirement | why it holds |
|-------------|--------------|
| `ContextBrainSupplier<'xai', BrainSuppliesXai>` | inline type shape matches |

**articulation**: r8 clarified we inline the shape. the inline type `{ 'brain.supplier.xai': BrainSuppliesXai }` is structurally equivalent to the generic. rhachet can extract later.

---

### vision requirement 3: precedence

| requirement | why it holds |
|-------------|--------------|
| "creds getter > openai client > env var" | IIFE branches in this order |

**articulation**: IIFE line order is:
1. `if (supplier?.creds)` — check getter first
2. `if (context?.openai)` — check client second
3. else — env var fallback

the order is explicit and matches vision.

---

### vision requirement 4: env var fallback

| requirement | why it holds |
|-------------|--------------|
| "falls back to env var for simple usecases" | IIFE else branch |

**articulation**: when no context provided, the first two branches skip (no supplier, no openai). control reaches `process.env.XAI_API_KEY` fallback.

---

### vision requirement 5: error for absent credentials

| requirement | why it holds |
|-------------|--------------|
| "throw clear error: XAI_API_KEY required" | BadRequestError with message |

**articulation**: blueprint line 132 shows:
```ts
throw new BadRequestError('XAI_API_KEY required — provide via context or env');
```

message tells user exactly what to do.

---

### criteria usecase 1-8

all 8 usecases were verified in r6. the r7 fix (fail fast on undefined) doesn't affect criteria coverage — it's a pit of success edgecase, not a usecase.

---

## final coverage status

| category | status |
|----------|--------|
| vision requirements 1-5 | covered |
| vision benefits (5) | covered |
| vision usecases (4) | covered |
| vision pit of success | 1 fixed (fail fast) |
| criteria usecases (8) | covered |

**blueprint has complete behavior declaration coverage.**

---

## key takeaway

> type contract is the source of truth for runtime behavior.

when vision prose conflicts with type contract, the type contract wins. this is why we write types — they are precise.

