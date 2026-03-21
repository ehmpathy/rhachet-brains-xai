# behavior-declaration-adherance: self-review round 5

## i verify each blueprint line against actual implementation

### ContextBrainSupplier.ts

| blueprint says | actual code | adherent? |
|----------------|-------------|-----------|
| file: `src/_topublish/rhachet/ContextBrainSupplier.ts` | file exists at path | ✓ |
| generic type `<TSlug extends string, TSupplies>` | lines 8-9: `<TSlug extends string, TSupplies>` | ✓ |
| shape: `{ [\`brain.supplier.${TSlug}\`]: TSupplies }` | line 10: `[K in \`brain.supplier.${TSlug}\`]: TSupplies` | ✓ |

---

### BrainSuppliesXai in BrainAtom.config.ts

| blueprint says | actual code | adherent? |
|----------------|-------------|-----------|
| type: `{ creds: () => Promise<{ XAI_API_KEY: string }> }` | lines 18-20: exact shape | ✓ |

---

### getSdkXaiCreds.ts

| blueprint says | actual code | adherent? |
|----------------|-------------|-----------|
| file: `src/domain.operations/creds/getSdkXaiCreds.ts` | file exists at path | ✓ |
| signature: `(input: Empty, context?: ...)` | line 14: `(input: Empty, context?: ...)` | ✓ |
| extract supplier from context | line 18: `const supplier = context?.['brain.supplier.xai']` | ✓ |
| if supplier present, call getter | line 21: `if (supplier?.creds)` | ✓ |
| fail-fast on undefined | line 25: `BadRequestError.throw(...)` | ✓ |
| fallback to env var | line 30: `process.env.XAI_API_KEY` | ✓ |
| fail-fast if absent | line 32: `throw new BadRequestError(...)` | ✓ |
| output: `Promise<{ XAI_API_KEY: string }>` | line 16: return type matches | ✓ |

---

### genBrainAtom.ts

| blueprint says | actual code | adherent? |
|----------------|-------------|-----------|
| import getSdkXaiCreds | line 14: `import { getSdkXaiCreds }` | ✓ |
| import BrainSuppliesXai | line 18: `import { ..., BrainSuppliesXai }` | ✓ |
| re-export BrainSuppliesXai | line 24: `export { BrainSuppliesXai }` | ✓ |
| context type includes supplier | line 67: `{ 'brain.supplier.xai'?: BrainSuppliesXai }` | ✓ |
| uses getSdkXaiCreds | line 78: `await getSdkXaiCreds({}, context)` | ✓ |

---

### sdk/index.ts

| blueprint says | actual code | adherent? |
|----------------|-------------|-----------|
| export BrainSuppliesXai | line 1: `export { ..., BrainSuppliesXai }` | ✓ |

---

### test coverage

| blueprint says | actual | adherent? |
|----------------|--------|-----------|
| getSdkXaiCreds.test.ts: 4 cases | 4 cases (supplier, env fallback, undefined throws, absent throws) | ✓ |
| genBrainAtom.credentials.integration.test.ts: 4 cases | 4 cases in file | ✓ |

---

## conclusion

all blueprint declarations are adherent in implementation:
- 7/7 ContextBrainSupplier declarations
- 1/1 BrainSuppliesXai declarations
- 8/8 getSdkXaiCreds declarations
- 5/5 genBrainAtom declarations
- 1/1 sdk export declarations
- 2/2 test file declarations

no deviations found.
