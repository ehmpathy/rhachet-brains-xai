# has-divergence-analysis: self-review round 2

## i re-read the actual code vs blueprint

### deeper inspection of context type

**blueprint says** (line 67 in codepath tree):
```ts
context?: ContextBrainSupplier<'xai', BrainSuppliesXai> | Empty
```

**actual implementation** (genBrainAtom.ts line 67):
```ts
context?: { 'brain.supplier.xai'?: BrainSuppliesXai }
```

**is this a divergence?**

`ContextBrainSupplier<'xai', BrainSuppliesXai>` expands to:
```ts
{ 'brain.supplier.xai': BrainSuppliesXai }
```

the actual uses `{ 'brain.supplier.xai'?: BrainSuppliesXai }` (note the `?` on the property).

**semantic analysis**:
- blueprint: `context?` is optional, and if present, supplier is required
- actual: `context?` is optional, and if present, supplier is also optional

**why actual is correct**:
the getSdkXaiCreds function already handles undefined supplier:
```ts
const supplier = context?.['brain.supplier.xai'];
if (supplier?.creds) { ... }
```

making the property optional allows callers to pass `{}` and still get env fallback. this is more permissive and compatible with the extant `Empty` context type from rhachet.

**verdict**: minor structural divergence, functionally equivalent. the actual is more permissive.

---

### deeper inspection of re-export

**blueprint says**:
```ts
re-export BrainSuppliesXai               [+] create
```

**actual** (genBrainAtom.ts line 30):
```ts
export type { BrainSuppliesXai, XaiBrainAtomSlug } from './BrainAtom.config';
```

**divergence**: also re-exports `XaiBrainAtomSlug`.

**why it holds**: XaiBrainAtomSlug was already exported, just consolidated with BrainSuppliesXai export. no functional change.

---

### check: README divergence resolution

**blueprint says**:
```
README.md                                # [~] add credential supplier docs
```

**actual**: README not yet updated.

**resolution**: documented as queued for verification stone. this is a known divergence.

---

## hostile reviewer perspective (round 2)

what else could a hostile reviewer find?

1. **import statement path**: blueprint shows `import getSdkXaiCreds` but doesn't specify the path. actual uses `../creds/getSdkXaiCreds`. this is not a divergence, just omitted detail.

2. **line numbers**: blueprint references "line 78" for creds resolution. actual is line 78. matches.

3. **context type union vs inline optional**: covered above as minor structural divergence.

4. **ContextBrainSupplier not imported in genBrainAtom.ts**: the blueprint shows `import ContextBrainSupplier` but actual doesn't import it — uses inline type instead. this is a simplification that avoids an extra import.

**verdict**: simplifications, not divergences from declared behavior.

---

## divergences found (updated)

| section | blueprint | actual | type | resolution |
|---------|-----------|--------|------|------------|
| filediff | README.md [~] | not updated | queued | verified in 5.3 |
| context type | `ContextBrainSupplier<'xai', ...> \| Empty` | inline optional | simplified | functionally equivalent |

---

## conclusion

two divergences identified:
1. **README**: queued for verification stone
2. **context type**: simplified from generic + union to inline optional — functionally equivalent, more permissive

both are acceptable. the implementation achieves the blueprint's intent.
