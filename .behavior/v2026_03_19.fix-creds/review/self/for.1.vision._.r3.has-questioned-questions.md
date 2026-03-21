# self-review r3: has-questioned-questions

## questions triaged

### question 1: should the getter be cached?

| triage step | result |
|-------------|--------|
| can this be answered via logic now? | no — depends on intended usage patterns |
| can this be answered via extant docs or code now? | no — this is a new feature |
| should this be answered via external research later? | no — not a factual question |
| does only the wisher know the answer? | yes — they understand the use cases |

**status**: [wisher]

**why it must go to wisher**: cache behavior affects performance and correctness. if users expect fresh credentials (for rotation), cache would break them. if users expect cache (for performance), always-fresh would hammer their vault. only the wisher knows the intended balance.

---

### question 2: should we support sync getters?

| triage step | result |
|-------------|--------|
| can this be answered via logic now? | yes |
| reason | sync getters can wrap return in fulfilled promise. async covers all cases. one pattern is simpler than two. |

**status**: [answered]

**why this holds**: the question is about type signature, not behavior. `() => Promise<T>` can represent both sync and async. sync callers just write `async () => ({ XAI_API_KEY: 'literal' })`. no need for separate `MaybePromise<T>` type.

**action**: moved to "questions answered" section in vision.

---

### question 3: exact shape of ContextBrainSupplier?

| triage step | result |
|-------------|--------|
| can this be answered via logic now? | no — design decision |
| can this be answered via extant docs or code now? | partially — wisher's example gives a shape |
| should this be answered via external research later? | no — this is a design choice, not a fact |
| does only the wisher know the answer? | yes — they know how it fits rhachet |

**status**: [wisher]

**why it must go to wisher**: the wisher gave an example shape `{ ['brain.supplier.xai']: { creds: ... } }`. we proposed to match it. but they might prefer nested objects `{ brain: { supplier: { xai: ... } } }`. only they know the rhachet conventions.

---

### question 4: review how rhachet handles Context* types

| triage step | result |
|-------------|--------|
| can this be answered via logic now? | no |
| can this be answered via extant docs or code now? | yes — by read of rhachet code |
| should this be answered via external research later? | yes — requires code exploration |

**status**: [research]

**why this is research**: this is a factual question about extant code. we can answer it by read of rhachet, but it's not critical for the vision. defer to research phase.

---

### question 5: does openai client accept apiKey per-call?

| triage step | result |
|-------------|--------|
| can this be answered via logic now? | yes — current code does this |
| evidence | genBrainAtom.ts lines 74-79: `new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: ... })` |

**status**: [answered]

**why this holds**: the current implementation already creates a new OpenAI client per ask() if not provided in context. the getter pattern doesn't change this — it just changes where the apiKey comes from.

**action**: moved to "questions answered" section in vision.

---

### question 6: verify openai client creation is cheap

| triage step | result |
|-------------|--------|
| can this be answered via logic now? | no |
| can this be answered via extant docs or code now? | maybe — by read of openai sdk |
| should this be answered via external research later? | yes — requires measurement |

**status**: [research]

**why this is research**: we could guess based on sdk code, but accurate answer requires measurement. defer to research phase.

---

## summary of triage

| question | status | action |
|----------|--------|--------|
| getter cache behavior | [wisher] | ask wisher |
| sync getter support | [answered] | answered via logic |
| ContextBrainSupplier shape | [wisher] | ask wisher |
| rhachet Context* types | [research] | defer to research |
| openai apiKey per-call | [answered] | answered via code |
| openai client creation cost | [research] | defer to research |

---

## issues found and how they were fixed

### issue 1: vision had flat list of questions without triage status

**before**: the vision had "questions for wisher" and "external research needed" but no [answered] section. questions were listed without status markers.

**problem**: a future reader couldn't tell what was decided vs what needed input. they might re-research an answered question or wait for wisher on a question we can decide now.

**how fixed**: reorganized into three sections with explicit status markers:
- "questions for wisher [wisher]" — requires human input
- "questions answered [answered]" — decided in review, with reason
- "external research needed [research]" — factual questions to answer later

**verification**: confirmed vision now has this structure at lines 181-207.

---

### issue 2: answerable questions were marked as open

**before**: "should we support sync getters?" and "does openai client accept apiKey per-call?" were in the open questions list.

**problem**: these can be answered via logic and code inspection. to leave them open wastes future effort.

**how fixed**:
- sync getters: answered NO via logic — async-only covers all cases, sync can wrap in promise
- apiKey per-call: answered YES via code — genBrainAtom.ts lines 74-79 already do this

**verification**: confirmed these now appear in "questions answered" section with full reason.

---

### issue 3: duplicate research item

**before**: "verify openai client accepts apiKey per-call" was in research list.

**problem**: this was answerable via code inspection (see issue 2). its presence in research was redundant.

**how fixed**: removed from research list, moved to answered list.

**verification**: research list now has only 2 items, not 3.

---

## non-issues confirmed (with reason for future learners)

### all 6 questions are now triaged

every question in the vision has a clear status:
- 2 questions [wisher] — cache behavior, namespace shape
- 2 questions [answered] — sync getters, apiKey per-call
- 2 questions [research] — rhachet Context types, openai client cost

**why this holds**: i verified each question against the triage criteria. no question is left ambiguous.

**why this matters for future learners**: triaged questions prevent wasted effort. a junior won't spend 3 hours on research when the wisher has the answer. a senior won't wait for wisher when logic suffices.

---

### answered questions have reason and evidence

each [answered] question includes:
- the answer itself
- the reason or evidence
- the status marker

**why this holds**: i verified both answered questions have substantive reason, not just "decided: X".

**why this matters for future learners**: reason enables validation. if a reader disagrees with the answer, they can challenge the reason. if reason is absent, they can only challenge the authority — which is unconstructive.
