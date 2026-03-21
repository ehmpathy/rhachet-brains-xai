# behavior-declaration-adherance: self-review round 6

## i review each file changed against vision, criteria, and blueprint

this is a line-by-line verification that implementation matches specification.

---

## ContextBrainSupplier.ts

### vision check

vision says:
> "type structure: ContextBrainSupplier<TSupplierSlug, TSupplierSupplies>"
> "note = lives in _topublish/rhachet/ for future lift to rhachet core"

actual:
- file at `src/_topublish/rhachet/ContextBrainSupplier.ts` ✓
- type: `ContextBrainSupplier<TSlug extends string, TSupplies>` ✓

### blueprint check

blueprint says:
```ts
export type ContextBrainSupplier<
  TSlug extends string,
  TSupplies,
> = {
  [K in `brain.supplier.${TSlug}`]: TSupplies;
};
```

actual lines 8-11 match exactly. ✓

**verdict**: adherent

---

## BrainSuppliesXai in BrainAtom.config.ts

### vision check

vision says:
> "{ creds: () => Promise<{ XAI_API_KEY: string }> }"

actual lines 18-20:
```ts
export type BrainSuppliesXai = {
  creds: () => Promise<{ XAI_API_KEY: string }>;
};
```

exact match. ✓

### blueprint check

blueprint specifies same shape. ✓

**verdict**: adherent

---

## getSdkXaiCreds.ts

### vision check

vision says:
> "credentials never stored in plaintext"
> "fallback to env var for simple usecases"

actual:
- getter returns promise, consumed immediately ✓
- lines 27-34 implement env fallback ✓

### criteria check

| criterion | implementation |
|-----------|----------------|
| usecase.1: env var fallback | lines 27-34 ✓ |
| usecase.2: call creds getter | lines 18-25 ✓ |
| usecase.2: NOT read env when supplier present | early return at line 25 ✓ |
| usecase.6: error propagation | getter errors propagate naturally ✓ |

### blueprint check

blueprint signature:
```ts
export const getSdkXaiCreds = async (
  input: Empty,
  context?: { 'brain.supplier.xai'?: BrainSuppliesXai },
): Promise<{ XAI_API_KEY: string }>
```

actual lines 14-16 match. ✓

blueprint implementation flow:
1. extract supplier from context ✓ (line 18)
2. if supplier present, call getter ✓ (line 21)
3. fail-fast on undefined ✓ (line 22-23)
4. fallback to env var ✓ (line 27)
5. fail-fast if absent ✓ (line 30-32)

**verdict**: adherent

---

## genBrainAtom.ts

### vision check

vision says:
> "await atom.ask({ ... }, context); // creds fetched just-in-time"

actual line 78: `const creds = await getSdkXaiCreds({}, context);`

just-in-time fetch confirmed. ✓

### criteria check

| criterion | implementation |
|-----------|----------------|
| usecase.1: without context uses env | getSdkXaiCreds handles this ✓ |
| usecase.2: with context calls getter | getSdkXaiCreds handles this ✓ |
| usecase.3: getter called per ask | getSdkXaiCreds called each ask() ✓ |
| usecase.4: multi-tenant | different contexts = different creds ✓ |

### blueprint check

blueprint says:
- import getSdkXaiCreds ✓ (line 14)
- import BrainSuppliesXai ✓ (line 18)
- re-export BrainSuppliesXai ✓ (line 24)
- context type includes supplier ✓ (line 67)
- uses getSdkXaiCreds ✓ (line 78)

**verdict**: adherent

---

## sdk/index.ts

### blueprint check

blueprint says: export BrainSuppliesXai

actual line 1 includes BrainSuppliesXai in exports. ✓

**verdict**: adherent

---

## test coverage

### unit tests (getSdkXaiCreds.test.ts)

| blueprint case | implemented |
|----------------|-------------|
| 1. supplier calls getter | case 1 ✓ |
| 2. no context falls back to env | case 2 ✓ |
| 3. getter returns undefined throws | case 3 ✓ |
| 4. no supplier and no env throws | case 4 ✓ |

### integration tests (genBrainAtom.credentials.integration.test.ts)

| blueprint case | implemented |
|----------------|-------------|
| 1. context with creds getter succeeds | case 1 ✓ |
| 2. getter called fresh per ask | case 2 ✓ |
| 3. getter error propagates | case 3 ✓ |
| 4. multi-tenant isolation | case 4 ✓ |

**verdict**: adherent

---

## conclusion

all files reviewed line-by-line against vision, criteria, and blueprint:

| file | vision | criteria | blueprint | verdict |
|------|--------|----------|-----------|---------|
| ContextBrainSupplier.ts | ✓ | n/a | ✓ | adherent |
| BrainAtom.config.ts | ✓ | n/a | ✓ | adherent |
| getSdkXaiCreds.ts | ✓ | ✓ | ✓ | adherent |
| genBrainAtom.ts | ✓ | ✓ | ✓ | adherent |
| sdk/index.ts | n/a | n/a | ✓ | adherent |
| tests | n/a | ✓ | ✓ | adherent |

no deviations or drift detected.
