# has-consistent-conventions: self-review round 4

## i re-read the actual code files line by line

---

### ContextBrainSupplier.ts (lines 1-14)

```ts
export type ContextBrainSupplier<TSlug extends string, TSupplies> = {
  [K in `brain.supplier.${TSlug}`]: TSupplies;
};
```

**name questions**:

1. **`ContextBrainSupplier`** — is `Context` prefix correct?
   - extant pattern: rhachet uses `Context*` for context types
   - verdict: ✓ aligns

2. **`brain.supplier.${TSlug}`** — is this namespace correct?
   - vision prescribes: `'brain.supplier.' + TSupplierSlug`
   - verdict: ✓ follows vision exactly

3. **`TSlug`, `TSupplies`** — are generic names correct?
   - standard TypeScript convention for generics
   - `TSlug` = type of slug, `TSupplies` = type of supplies
   - verdict: ✓ standard

---

### BrainSuppliesXai (in BrainAtom.config.ts, lines 14-20)

```ts
export type BrainSuppliesXai = {
  creds: () => Promise<{ XAI_API_KEY: string }>;
};
```

**name questions**:

1. **`BrainSuppliesXai`** — follows `Brain*` + `*Xai` pattern?
   - extant: `XaiBrainAtomSlug` uses `Xai*` prefix
   - my choice: `BrainSuppliesXai` uses `*Xai` suffix
   - **potential divergence?** let me check...

   ```
   XaiBrainAtomSlug    = prefix
   BrainAtomConfig     = no xai suffix (generic)
   BrainSuppliesXai    = suffix
   ```

   **rationale**: `BrainSuppliesXai` is a noun phrase where "Xai" modifies "BrainSupplies". the vision uses "BrainSuppliesXai" explicitly. so this is prescribed, not divergent.

2. **`creds`** — short for credentials?
   - vision uses `creds` throughout
   - verdict: ✓ follows vision

3. **`XAI_API_KEY`** — uppercase?
   - matches env var convention `process.env.XAI_API_KEY`
   - verdict: ✓ intentional alignment with env var

---

### getSdkXaiCreds.ts (lines 1-35)

```ts
export const getSdkXaiCreds = async (
  input: Empty,
  context?: { 'brain.supplier.xai'?: BrainSuppliesXai },
): Promise<{ XAI_API_KEY: string }> => {
```

**name questions**:

1. **`getSdkXaiCreds`** — follows `get*` pattern?
   - extant: no other `get*` functions in codebase
   - but: `get` is standard for retrieval operations
   - verdict: ✓ standard domain operation pattern

2. **`Sdk` in name** — what does this mean?
   - refers to "sdk credentials" — the creds needed to use the xai sdk
   - distinguishes from other potential creds (e.g., user creds)
   - verdict: ✓ intentional specificity

3. **`input: Empty`** — why not just `()`?
   - follows `(input, context)` pattern from briefs
   - `Empty` placeholder for future input params
   - verdict: ✓ follows pattern

---

## what i verified

| name | convention | source | verdict |
|------|------------|--------|---------|
| `ContextBrainSupplier` | `Context*` prefix | rhachet pattern | ✓ |
| `brain.supplier.xai` | namespace key | vision | ✓ |
| `BrainSuppliesXai` | `Brain*` + `*Xai` | vision | ✓ |
| `creds` | short form | vision | ✓ |
| `XAI_API_KEY` | uppercase | env var convention | ✓ |
| `getSdkXaiCreds` | `get*` prefix | domain op pattern | ✓ |
| `input: Empty` | `(input, context)` | brief pattern | ✓ |

---

## conclusion

all name choices:
1. follow extant codebase patterns, or
2. follow vision prescription, or
3. follow established typescript/domain conventions

no divergence found.
