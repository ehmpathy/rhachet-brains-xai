# self-review: has-questioned-assumptions

## assumptions examined

### 1. "credentials never stored in plaintext" with getter pattern

| question | answer |
|----------|--------|
| what do we assume? | that a getter prevents plaintext storage |
| evidence? | the getter is called per-use, not stored in context |
| what if opposite? | the credential IS in memory after the getter returns — just briefly |
| did wisher say this? | wisher said "not pass creds in plaintext" |
| counterexample? | the `apiKey` variable holds plaintext after `await creds()` |

**issue found**: the getter pattern reduces plaintext exposure window, but doesn't eliminate it. the credential is still plaintext in memory after the getter returns — it's just not stored in a context object.

**action**: updated vision language from "never stored" to "fetched just-in-time" — more accurate. the benefit is reduced exposure window, not elimination.

**verdict**: assumption was overstated. fixed in vision.

---

### 2. "async overhead adds ~1ms per call"

| question | answer |
|----------|--------|
| what do we assume? | getter overhead is ~1ms |
| evidence? | none — i made this up |
| what if opposite? | vault calls could take 100ms+ |
| did wisher say this? | no |
| counterexample? | aws secrets manager has ~50-200ms latency |

**issue found**: i stated a specific latency without evidence. the actual overhead depends entirely on the getter implementation.

**action**: remove specific time claim. replace with "depends on getter implementation".

**verdict**: assumption was unfounded. removed from vision.

---

### 3. "getter is cheap enough to call per-request"

| question | answer |
|----------|--------|
| what do we assume? | users will cache internally if needed |
| evidence? | common pattern in secrets management |
| what if opposite? | users might not realize they need to cache |
| did wisher say this? | no |
| counterexample? | naive implementation calls vault every time |

**issue found**: this assumption may be valid, but we should make cache responsibility explicit.

**action**: already flagged in "questions for wisher" — whether to cache or let user handle.

**verdict**: assumption is reasonable but should be documented

---

### 4. "one credential per supplier — XAI_API_KEY is sufficient"

| question | answer |
|----------|--------|
| what do we assume? | xai only needs one api key |
| evidence? | xai docs show single api key pattern |
| what if opposite? | xai could add org id, project id, etc. |
| did wisher say this? | wisher only mentioned XAI_API_KEY |
| counterexample? | openai has both api key and org id |

**issue found**: the assumption holds for today, but the shape could limit future use.

**action**: the getter returns `{ XAI_API_KEY: string }` — this shape can be extended to `{ XAI_API_KEY: string; XAI_ORG_ID?: string }` without contract breaks.

**verdict**: assumption is acceptable — shape is extensible

---

### 5. "backwards compat via env var fallback is essential"

| question | answer |
|----------|--------|
| what do we assume? | contract break would harm users |
| evidence? | current tests use env vars |
| what if opposite? | maybe no one uses this package yet in prod |
| did wisher say this? | yes — "only fallback to env-var if not supplied" |
| counterexample? | early packages can break without harm |

**issue found**: none — the wisher explicitly requested env var fallback.

**verdict**: assumption is supported by wisher's explicit request

---

### 6. "openai client can accept apiKey per-call"

| question | answer |
|----------|--------|
| what do we assume? | we can construct OpenAI client with dynamic apiKey |
| evidence? | need to verify openai sdk behavior |
| what if opposite? | if sdk caches client, we'd need client-per-creds pattern |
| did wisher say this? | no — this is implementation detail |
| counterexample? | some sdks require singleton clients |

**issue found**: this is an implementation assumption that needs verification.

**action**: already flagged in "external research needed" section.

**verdict**: assumption needs verification — already tracked

---

### 7. "context?.openai pattern can coexist with new creds pattern"

| question | answer |
|----------|--------|
| what do we assume? | current code checks `context?.openai` — we can add creds check alongside |
| evidence? | code at line 74-79 shows current pattern |
| what if opposite? | if someone passes both `openai` and `creds`, which wins? |
| did wisher say this? | no |
| counterexample? | ambiguous precedence could cause bugs |

**issue found**: the vision doesn't address precedence when both `context.openai` and `context['brain.supplier.xai'].creds` are provided.

**action**: add to vision — clarify precedence: creds > openai > env var.

**verdict**: hidden assumption found. need to address in vision.

---

## issues found & fixes

### issue 1: "never stored in plaintext" overstated

**fix**: changed language to "fetched just-in-time" — more accurate

### issue 2: "~1ms overhead" unfounded

**fix**: removed specific time. latency depends on getter implementation.

### issue 3: precedence ambiguity

**fix**: need to clarify in vision: when both `context.openai` and `context['brain.supplier.xai'].creds` provided, which wins?

---

## non-issues confirmed

### getter pattern reduces exposure

the getter doesn't eliminate plaintext, but it does reduce the exposure window. the credential is fetched when needed, used immediately, and not stored in long-lived context objects.

### shape is extensible

`{ XAI_API_KEY: string }` can be extended without contract breaks.

### env var fallback is wisher-requested

not an assumption — explicitly requested in the wish.

---

## summary

| assumption | status |
|------------|--------|
| plaintext never stored | overstated — fixed |
| ~1ms overhead | unfounded — removed |
| getter is cheap per-request | reasonable — documented |
| one credential sufficient | acceptable — extensible |
| backwards compat essential | supported by wish |
| openai accepts dynamic key | needs verification — tracked |
| openai/creds coexistence | precedence ambiguous — needs fix |

**action needed**: update vision to clarify precedence order.
