# has-consistent-conventions: self-review round 3

## review question

for each name choice:
- what name conventions does the codebase use?
- do we use a different namespace, prefix, or suffix pattern?
- do we introduce new terms when extant terms exist?
- does our structure match extant patterns?

---

## extant conventions observed

### folder structure

```
src/
├─ contract/sdk/           # public exports
├─ domain.operations/      # domain logic
│  └─ atom/                # grouped by feature
├─ infra/cast/             # infrastructure utilities
└─ _topublish/rhachet/     # types to lift upstream
```

### file name conventions

| pattern | example | purpose |
|---------|---------|---------|
| `gen*.ts` | `genBrainAtom.ts` | factory functions |
| `*.config.ts` | `BrainAtom.config.ts` | configuration constants |
| `cast*.ts` | `castFromXaiToolCall.ts` | type converters |
| `get*.ts` | `getSdkXaiCreds.ts` | retrieval operations |

### type name conventions

| pattern | example | purpose |
|---------|---------|---------|
| `Xai*` | `XaiBrainAtomSlug` | xai-specific types |
| `Brain*` | `BrainAtomConfig` | brain-related types |
| `*Config` | `BrainAtomConfig` | configuration shapes |

---

## my name choices reviewed

### getSdkXaiCreds.ts

| convention | my choice | alignment |
|------------|-----------|-----------|
| `get` prefix | ✓ `getSdkXaiCreds` | follows `get*` pattern |
| domain folder | ✓ `domain.operations/creds/` | follows group pattern |
| file = function | ✓ `getSdkXaiCreds.ts` exports `getSdkXaiCreds` | standard |

**verdict**: holds ✓

---

### BrainSuppliesXai

| convention | my choice | alignment |
|------------|-----------|-----------|
| `Brain*` prefix | ✓ `BrainSuppliesXai` | follows brain type pattern |
| `*Xai` suffix | ✓ `BrainSuppliesXai` | xai-specific |
| location | ✓ `BrainAtom.config.ts` | config types in config file |

**verdict**: holds ✓

---

### ContextBrainSupplier

| convention | my choice | alignment |
|------------|-----------|-----------|
| `Context*` prefix | ✓ `ContextBrainSupplier` | follows context type pattern |
| `Brain*` in name | ✓ `ContextBrainSupplier` | brain-related |
| location | ✓ `_topublish/rhachet/` | types for upstream lift |

**verdict**: holds ✓

---

### creds/ subfolder

| convention | my choice | alignment |
|------------|-----------|-----------|
| feature group | ✓ `domain.operations/creds/` | follows `atom/` pattern |
| lowercase | ✓ `creds` | consistent with `atom`, `cast` |

**verdict**: holds ✓

---

## potential divergences considered

### "creds" vs "credentials"

i chose `creds` — is this consistent?

- extant: no prior credential terms in codebase
- blueprint: prescribes `creds` (not `credentials`)
- vision: uses `creds` in type definitions

**verdict**: follows blueprint and vision ✓

### "Supplies" vs "Provider" or "Supplier"

i chose `BrainSuppliesXai` — is this the right term?

- vision explicitly states: "supplies" because "supplier takes in small supplies (creds) and returns bigger supplies"
- avoids "provider" which is overloaded

**verdict**: follows vision terminology ✓

---

## conclusion

all name choices align with extant codebase conventions:
1. `getSdkXaiCreds` — follows `get*` pattern
2. `BrainSuppliesXai` — follows `Brain*` + `*Xai` pattern
3. `ContextBrainSupplier` — follows `Context*` + `Brain*` pattern
4. `creds/` folder — follows feature group pattern

no divergence from conventions found.
