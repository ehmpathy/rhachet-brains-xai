# self-review: has-questioned-requirements

## requirements examined

### 1. context-injected credentials via `ContextBrainSupplier<'xai', BrainSuppliesXai>`

| question | answer |
|----------|--------|
| who said this was needed? | wisher, in 0.wish.md |
| when? | at wish creation |
| why? | to avoid env-var-only credential sourcing |
| evidence? | env vars are static, can't rotate mid-session, shared across process |
| what if we didn't? | current behavior continues — works, but inflexible |
| simpler way? | could accept `{ apiKey: string }` directly — but that's plaintext |

**verdict**: requirement holds — context injection enables flexibility the wish explicitly requests

---

### 2. getter pattern `() => Promise<{ XAI_API_KEY: string }>`

| question | answer |
|----------|--------|
| who said this was needed? | wisher: "or even better, make the creds a getter" |
| why? | to avoid passing plaintext credentials around |
| evidence? | plaintext in memory is a security risk; getter defers retrieval |
| what if we didn't? | credentials stored in plaintext in context object |
| simpler way? | accept `{ apiKey: string }` directly — simpler, but less secure |

**verdict**: requirement holds — the wisher explicitly prefers the getter pattern

---

### 3. fallback to env var

| question | answer |
|----------|--------|
| who said this was needed? | wisher: "only fallback to env-var if not supplied" |
| why? | backwards compatibility, simple local dev |
| evidence? | current tests rely on `process.env.XAI_API_KEY` |
| what if we didn't? | breaking change — all consumers must provide context |
| simpler way? | no — fallback is the simplest path for backwards compat |

**verdict**: requirement holds — essential for backwards compatibility

---

### 4. `ContextBrainSupplier` shape with `brain.supplier.xai` namespace

| question | answer |
|----------|--------|
| who said this was needed? | I proposed this shape |
| why? | future-proof for rhachet lift, avoids namespace collision |
| evidence? | wisher: "where ContextBrainSupplier we will eventually lift up into rhachet" |
| what if simpler? | could use `context.xai.creds()` — shorter |
| scope concern? | yes — I may be over-engineering |

**issue found**: the explicit namespace `brain.supplier.xai` may be premature optimization.

the wisher's example used `{ ['brain.supplier.xai']: { creds: { XAI_API_KEY } } }` — so the shape is explicitly requested. but i should validate this is the desired namespace structure.

**action**: added to "questions for wisher" section — confirmed this is already listed as question #3.

**verdict**: keep as proposed, but flag for wisher validation

---

### 5. multi-tenant usecase (different creds per customer)

| question | answer |
|----------|--------|
| who said this was needed? | I added it as a usecase |
| why? | seemed like a natural extension |
| evidence? | none from wisher — this is my extrapolation |
| what if we didn't? | vision would be more focused |
| scope concern? | yes — may be scope creep |

**issue found**: multi-tenant is a secondary benefit, not a requirement from the wish.

**action**: the usecase is valid (it works if we implement the core), but it shouldn't drive design decisions. the vision correctly shows it as a usecase, not a requirement.

**verdict**: keep as illustrative usecase, but don't over-optimize for it

---

### 6. async-only getter

| question | answer |
|----------|--------|
| who said this was needed? | I proposed async-only |
| why? | consistency — async covers sync cases (sync getters can wrap in Promise) |
| evidence? | wisher used `Promise<{ XAI_API_KEY: string }>` in example |
| simpler way? | could support `MaybePromise<T>` — but adds type complexity |

**verdict**: requirement holds — async-only is simpler and covers all cases

---

## issues found & fixes

### issue 1: multi-tenant may be scope creep

**how it was fixed**: kept as illustrative usecase in vision, but clarified it's a secondary benefit, not a driver. no design decisions hinge on it.

### issue 2: namespace shape needs wisher validation

**how it was fixed**: already flagged in "questions for wisher" section (#3). no further action needed.

---

## non-issues confirmed

### the getter pattern is justified

the wisher explicitly requested "make the creds a getter" — this isn't my invention. the security benefit (not passing plaintext) is real.

### env var fallback is essential

breaking backwards compatibility would harm all current users. the fallback is the right call.

### async-only is sufficient

sync getters can wrap their return value in a fulfilled promise. supporting both sync and async adds type complexity for marginal benefit.

---

## summary

| requirement | status |
|-------------|--------|
| context-injected credentials | holds |
| getter pattern | holds |
| env var fallback | holds |
| namespace shape | holds, pending wisher validation |
| multi-tenant usecase | holds as illustration, not driver |
| async-only getter | holds |

the vision is sound. no requirements need to be removed. one needs validation with the wisher (namespace shape).
