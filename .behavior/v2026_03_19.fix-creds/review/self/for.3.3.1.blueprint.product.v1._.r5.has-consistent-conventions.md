# self-review r5: has-consistent-conventions

## extant conventions in this codebase

### type name conventions

| extant type | pattern |
|-------------|---------|
| `BrainAtomConfig` | PascalCase, domain prefix |
| `XaiBrainAtomSlug` | PascalCase, Xai prefix |

### function name conventions

| extant function | pattern |
|-----------------|---------|
| `genBrainAtom` | camelCase, gen prefix |
| `getBrainAtomsByXAI` | camelCase, get prefix |
| `castFromXaiToolCall` | camelCase, cast prefix |
| `castIntoXaiToolDef` | camelCase, cast prefix |

### JSDoc conventions

```ts
/**
 * .what = purpose
 * .why = reason
 */
```

### export conventions

re-export with comment:
```ts
// re-export for consumers
export type { XaiBrainAtomSlug } from './BrainAtom.config';
```

---

## blueprint names vs extant conventions

### type: BrainSuppliesXai

| aspect | blueprint | extant pattern | consistent? |
|--------|-----------|----------------|-------------|
| case | PascalCase | PascalCase | yes |
| structure | `Brain` + `Supplies` + `Xai` | `Brain` + `Atom` + `Config` | yes |
| Xai position | suffix | prefix or suffix both used | yes |

**verdict**: consistent. `BrainSuppliesXai` follows the `Brain*Xai` pattern seen in `XaiBrainAtomSlug`.

---

### property: creds

| aspect | blueprint | extant pattern | consistent? |
|--------|-----------|----------------|-------------|
| case | camelCase | camelCase | yes |
| shorthand | `creds` for credentials | `spec` for specification | yes |

**verdict**: consistent. short property names used (spec, cost, gain, etc.).

---

### JSDoc: .what/.why format

| aspect | blueprint | extant pattern | consistent? |
|--------|-----------|----------------|-------------|
| format | `.what = ...` / `.why = ...` | `.what = ...` / `.why = ...` | yes |
| location | on type export | on type and function exports | yes |

**verdict**: consistent. blueprint uses exact extant JSDoc format.

---

### export: re-export pattern

| aspect | blueprint | extant pattern | consistent? |
|--------|-----------|----------------|-------------|
| pattern | `export { BrainSuppliesXai }` | `export { genBrainAtom }` | yes |
| from sdk/index.ts | yes | yes | yes |

**verdict**: consistent. blueprint follows extant sdk export pattern.

---

### namespace: brain.supplier.xai

| aspect | analysis |
|--------|----------|
| pattern | dot-separated namespace |
| extant similar? | no — but this is new feature |
| prescribed by wisher? | yes — vision specifies this namespace |

**verdict**: consistent with vision prescription. new namespace for new feature.

---

## issues found

none. all names follow extant conventions:

| blueprint name | convention | status |
|---------------|------------|--------|
| `BrainSuppliesXai` | PascalCase with Brain prefix | consistent |
| `creds` | camelCase short property | consistent |
| JSDoc `.what/.why` | exact extant format | consistent |
| sdk re-export | extant pattern | consistent |
| `brain.supplier.xai` | wisher-prescribed | consistent |

---

## non-issues confirmed

| convention | why it holds |
|------------|-------------|
| type name | follows `Brain*` pattern |
| property name | follows short camelCase pattern |
| JSDoc format | exact match |
| export pattern | exact match |
| namespace | wisher-prescribed, no extant to conflict |

---

## key insight

**the codebase has strong conventions**

this codebase is consistent:
- all types start with `Brain` or `Xai`
- all functions use verb prefixes (gen, get, cast)
- all JSDoc uses `.what/.why` format
- sdk/index.ts is the public export point

the blueprint follows all of these. no divergence found.

