# self-review r3: has-pruned-backcompat

## backwards compatibility concerns in blueprint

### concern 1: Empty context still works

| aspect | analysis |
|--------|----------|
| the pattern | `context?: ContextBrainSupplier<'xai', BrainSuppliesXai> \| Empty` |
| what it preserves | `ask()` can be called without any context |
| did wisher explicitly say to maintain this? | yes |
| evidence | vision usecase 1: "just works — falls back to process.env.XAI_API_KEY" |

**verdict**: explicitly requested. vision usecase 1 requires that `ask()` work without context.

---

### concern 2: env var fallback

| aspect | analysis |
|--------|----------|
| the pattern | fallback to `process.env.XAI_API_KEY` when no context |
| what it preserves | extant code that relies on env var continues to work |
| did wisher explicitly say to maintain this? | yes |
| evidence | criteria usecase.1: "when ask() is called without context then it should use process.env.XAI_API_KEY" |

**verdict**: explicitly requested. criteria usecase.1 explicitly requires env var fallback.

---

### concern 3: context.openai still works

| aspect | analysis |
|--------|----------|
| the pattern | `if (context?.openai) { return context.openai as OpenAI; }` |
| what it preserves | extant code that passes `{ openai: client }` in context |
| did wisher explicitly say to maintain this? | implicitly yes |
| evidence | criteria usecase.7: "openai client takes precedence over env var" |

**verdict**: implicitly requested. criteria usecase.7 specifies the precedence order which includes `context.openai`. this is not "to be safe" — it's part of the prescribed precedence chain.

---

### concern 4: error message consistency

| aspect | analysis |
|--------|----------|
| the pattern | `throw new BadRequestError('XAI_API_KEY required — provide via context or env')` |
| what it preserves | clear error when credentials absent |
| did wisher explicitly say to maintain this? | yes |
| evidence | criteria usecase.1: "throw clear error if XAI_API_KEY env var is absent" |

**verdict**: explicitly requested. criteria requires clear error message.

---

## issues found

none. all backwards compatibility concerns trace to explicit requirements:

| concern | source |
|---------|--------|
| Empty context works | vision usecase 1 |
| env var fallback | criteria usecase.1 |
| context.openai works | criteria usecase.7 |
| error message | criteria usecase.1 |

---

## non-issues confirmed

no backwards compat was added "to be safe" or "just in case". each concern maps to vision or criteria.

---

## key insight

**backwards compat was part of the design, not an afterthought**

the wisher explicitly designed for backwards compat:
- vision usecase 1 preserves env var workflow
- criteria usecase.7 preserves context.openai workflow
- criteria usecase.1 preserves clear error messages

this isn't defensive backwards compat — it's prescribed behavior. the feature is additive: new context-supplier path, extant paths preserved.

---

## open questions for wisher

none. all backwards compat is explicitly prescribed.

