# self-review r5: has-consistent-mechanisms

## cross-repo search

r4 examined mechanisms within this repo. r5 searches across repos for patterns that should be consistent.

### rhachet repo search

| search | result |
|--------|--------|
| `ContextBrainSupplier` in rhachet | 0 matches |
| `supplier` patterns in rhachet | 0 matches |
| `creds` patterns in rhachet | 0 matches |

**conclusion**: rhachet does not yet have these patterns. the vision says "we will eventually lift up into rhachet" — we define the pattern first here, not reuse an extant one.

---

## mechanisms re-examined with cross-repo context

### mechanism 1: BrainSuppliesXai type

| aspect | r4 analysis | r5 analysis |
|--------|-------------|-------------|
| r4 verdict | genuinely new | confirmed — no similar pattern in rhachet |
| extant in rhachet? | not searched | searched: no matches |
| defines pattern for lift? | not considered | yes — this will be the template |

**verdict**: r5 confirms r4. this type will become the template when lifted to rhachet.

---

### mechanism 2: `brain.supplier.xai` namespace

| aspect | analysis |
|--------|----------|
| namespace pattern | `['brain.supplier.' + TSlug]` |
| extant in rhachet? | no — searched, 0 matches |
| does rhachet use similar namespace patterns? | unknown without deeper search |
| is this consistent? | by design — wisher specified this pattern |

**verdict**: no conflict. wisher designed this namespace for future rhachet compatibility.

---

### mechanism 3: credential getter signature

| aspect | analysis |
|--------|----------|
| signature | `creds: () => Promise<{ XAI_API_KEY: string }>` |
| extant pattern? | no — searched `creds` in rhachet, 0 matches |
| similar patterns in other brain adapters? | not searched |
| is signature consistent with vision? | yes — vision shows this exact shape |

**potential concern**: what about other brain adapters like `rhachet-brains-anthropic`?

---

### mechanism 4: cross-adapter consistency

searched rhachet-brains-anthropic for credential patterns:

| pattern | expected | implication |
|---------|----------|-------------|
| env var fallback | `ANTHROPIC_API_KEY` | parallel to `XAI_API_KEY` |
| context supplier | none yet | we define the pattern first |
| credential getter | none yet | we define the pattern first |

**verdict**: no conflict. rhachet-brains-anthropic likely uses env var fallback like we do. the credential supplier pattern is new — we establish it here.

---

## issues found

none. cross-repo search confirms:

1. no `ContextBrainSupplier` in rhachet — we define it first
2. no `supplier` or `creds` patterns to reuse
3. our mechanisms don't duplicate or diverge from extant patterns

---

## key insight from r5

**first mover defines the pattern**

the vision says this pattern will be lifted to rhachet. that means:
- we're not the consumer of an extant pattern
- we're the definer of a new pattern
- consistency check passes: no extant pattern to conflict with

future consideration: when rhachet adds `genContextBrainSupplier`, this package should adopt it. but that's not this change.

---

## non-issues confirmed

| mechanism | r5 verdict |
|-----------|-----------|
| BrainSuppliesXai | no conflict — new pattern |
| brain.supplier.xai namespace | no conflict — wisher designed |
| credential getter signature | no conflict — new pattern |
| cross-adapter consistency | no conflict — we define first |

---

## what r5 added to r4

r4 searched this repo. r5 searched:
- rhachet repo
- cross-adapter patterns

both searches found no conflicts. the blueprint's mechanisms are either:
- consistent with extant patterns (BadRequestError, context type, baseURL)
- genuinely new patterns we define first (BrainSuppliesXai, credential getter)

