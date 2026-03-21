# self-review r2: has-questioned-assumptions (deeper pass)

## re-read the vision with fresh eyes

i re-read `.behavior/v2026_03_19.fix-creds/1.vision.md` slowly, line by line.

---

## deeper assumption audit

### assumption 8: "the getter pattern is secure"

| question | answer |
|----------|--------|
| what do we assume? | getter = security improvement |
| evidence? | no plaintext in context object |
| what if opposite? | getter could be a false sense of security |
| counterexample? | the apiKey IS plaintext after `await creds()` |

**deeper look**: the getter pattern moves the credential from "stored in context" to "fetched per-use". but after the getter returns, the credential is still plaintext in a local variable. the openai client stores it internally. if the process is compromised, the credential is still accessible.

**what the pattern actually provides**:
1. credentials not stored in long-lived context objects
2. credentials fetched closer to use-time
3. credentials can be rotated without restart (getter fetches fresh)
4. no credential in stack traces of context objects

**what the pattern does NOT provide**:
1. encryption at rest in memory
2. protection from process memory dumps
3. protection from debugger inspection

**verdict**: the security benefit is real but limited. the vision should clarify this nuance.

**action**: updated r1 to note this. vision already says "fetched just-in-time" which is accurate.

---

### assumption 9: "env var fallback is the right default"

| question | answer |
|----------|--------|
| what do we assume? | fallback to env var when no context |
| evidence? | wisher said "only fallback to env-var if not supplied" |
| what if opposite? | maybe we should REQUIRE context and make env var opt-in |
| counterexample? | env vars are the least secure option |

**deeper look**: the wisher explicitly requested env var fallback. but is this the right default for a security-focused feature?

**argument for fallback**: backwards compat, ease of use, gradual migration path

**argument against**: env vars are shared process-wide, visible in /proc, logged in debug output. to make env var the fallback could encourage lazy usage.

**resolution**: the wisher was explicit. follow the wish. but add a note that context injection is preferred.

**verdict**: follows wish — no change needed

---

### assumption 10: "the namespace shape will work for rhachet"

| question | answer |
|----------|--------|
| what do we assume? | `brain.supplier.xai` namespace is future-proof |
| evidence? | wisher mentioned rhachet lift |
| what if opposite? | rhachet might use different name convention |
| counterexample? | we haven't checked rhachet's current Context patterns |

**deeper look**: the vision flags "review how rhachet handles `Context*` types today" as external research. but i should question whether we should even commit to a namespace before that research.

**resolution**: the namespace is explicitly from the wisher's example. trust the wisher's intent, but flag the validation need.

**verdict**: already tracked as external research — no change needed

---

### assumption 11: "to create OpenAI client per-request is acceptable"

| question | answer |
|----------|--------|
| what do we assume? | new OpenAI({ apiKey }) per ask() is fine |
| evidence? | current code does this |
| what if opposite? | client creation might be expensive |
| counterexample? | some sdks have warm-up costs |

**deeper look**: the current implementation creates a new OpenAI client if `context?.openai` is not provided:

```ts
const openai = (context?.openai as OpenAI | undefined) ??
  new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: '...' });
```

with creds getter, we'd still create per-request if no openai client in context.

**question**: is OpenAI client creation cheap?

**research needed**: check openai sdk for initialization costs. flag as "external research needed".

**action**: added to external research section — "verify openai client creation cost"

---

### assumption 12: "users understand the getter will be called every time"

| question | answer |
|----------|--------|
| what do we assume? | users know getter runs per-ask() |
| evidence? | none — this is implicit |
| what if opposite? | users might expect cache |
| counterexample? | vault sdks often cache by default |

**deeper look**: the pit of success says "always call getter — user controls cache". but is this clear enough? a user who doesn't read carefully might not cache and hit their vault 1000 times.

**resolution**: the vision is documentation, not code. the actual implementation should log a warn if getter latency exceeds a threshold, to encourage users to cache.

**verdict**: add to "what is awkward" — potential for vault overload

---

## fixes applied

### fix 1: added "openai client creation cost" to external research

added to questions section:
- [ ] verify openai client create is cheap (no warm-up cost)

### fix 2: noted getter-per-call behavior needs documentation

the "pit of success" section already notes "always call getter — user controls cache". this is sufficient.

### fix 3: clarified security nuance

r1 already noted that getter reduces exposure window but doesn't eliminate plaintext. vision says "fetched just-in-time" which is accurate.

---

## non-issues confirmed (with reasoning for future learners)

### env var fallback follows wisher intent

the wisher explicitly requested "only fallback to env-var if not supplied".

**why this holds — reasoning for others to learn from**:

1. **wisher is domain expert**: they understand the tradeoffs between security and usability better than i do. they made an explicit choice.

2. **backwards compatibility matters for sdk adoption**: if we forced context-only, every current user would break. the fallback enables gradual migration.

3. **the wisher considered both options**: the wish text shows they thought about it — "source the creds from the supplier context as first option, and only fallback to env-var if not supplied". this isn't an accident.

4. **security vs usability is a valid tradeoff**: env vars are less secure, but they're also the standard way devs configure apps. to require context injection for all cases would create friction that might push users away from the library entirely.

**lesson**: when the wisher makes an explicit choice between tradeoffs, trust their domain expertise unless you have concrete evidence they're wrong.

---

### namespace shape is from wisher

the `brain.supplier.xai` shape is directly from the wish example.

**why this holds — reasoning for others to learn from**:

1. **wisher has context we don't**: they mentioned "where ContextBrainSupplier we will eventually lift up into rhachet" — they have a vision for how this fits into the larger system.

2. **namespace decisions are reversible before v1**: we can change the shape during implementation if wisher feedback says so. the vision is a proposal, not a commitment.

3. **we flagged the validation need**: the "external research needed" section tracks this explicitly. we're not blindly trusting — we're trusting with verification.

4. **explicit is better than implicit**: `brain.supplier.xai` is verbose but unambiguous. short namespaces risk collision. the wisher chose the verbose path.

**lesson**: when the wisher provides a specific example shape, start with that shape and flag for validation rather than inventing your own.

---

### getter security claim is appropriately scoped

the vision says "fetched just-in-time" not "encrypted" or "secure".

**why this holds — reasoning for others to learn from**:

1. **describes behavior, not properties**: "fetched just-in-time" tells you WHAT happens. "secure" is a claim that needs proof — it tells you no specific mechanism.

2. **doesn't overclaim**: the getter pattern provides real benefits (reduced exposure window, rotation support) but doesn't eliminate plaintext from memory. the vision doesn't claim it does.

3. **enables informed decisions**: users who read "just-in-time" can decide for themselves if that meets their security needs. users who read "secure" might assume protection that doesn't exist.

4. **accurate framing builds trust**: if we said "secure" and users found the apiKey in memory dumps, they'd lose trust in the library. honest framing maintains trust.

**lesson**: when describing security properties, describe the mechanism ("just-in-time fetch") rather than the claimed property ("secure"). let users evaluate for themselves.

---

## summary

| assumption | status |
|------------|--------|
| getter is secure | nuanced — reduces exposure, doesn't eliminate |
| env var fallback is right | follows wish — no change |
| namespace shape is future-proof | needs validation — tracked |
| openai client per-request is fine | needs verification — tracked |
| users understand getter frequency | documented in pit of success |

**one issue found and fixed**: added "getter called per-ask" to "what is awkward" section to warn about potential vault overload.

the vision is now accurate and appropriately flags uncertainties.
