# self-review r4: has-pruned-backcompat

## deeper examination

r3 examined 4 backwards compat concerns and found all explicitly requested. r4 digs deeper — are there hidden assumptions about backwards compat that we didn't question?

---

## hidden backcompat assumptions

### assumption 1: the `Empty` type is necessary

| question | analysis |
|----------|----------|
| what we use | `context?: ContextBrainSupplier<'xai', BrainSuppliesXai> \| Empty` |
| why `Empty` in union? | to allow empty object `{}` as valid context |
| is this prescribed? | yes — vision context type section shows `\| Empty` |
| could we omit `Empty`? | no — vision explicitly includes it |
| is this "to be safe"? | no — it's part of the prescribed type |

**verdict**: explicitly prescribed. the vision shows the exact type union with `| Empty`.

---

### assumption 2: context.openai preserves extant behavior

| question | analysis |
|----------|----------|
| what we preserve | `if (context?.openai) { return context.openai as OpenAI; }` |
| why preserve it? | extant code may pass `{ openai: client }` |
| is this prescribed? | yes — criteria usecase.7 specifies precedence |
| what if we removed it? | would break extant code that passes openai client |
| did wisher say "preserve extant"? | implicitly yes — criteria defines precedence chain |

**verdict**: implicitly prescribed via criteria. usecase.7 says "openai client takes precedence over env var" — this requires the openai branch to exist.

---

### assumption 3: error message text

| question | analysis |
|----------|----------|
| what we use | `'XAI_API_KEY required — provide via context or env'` |
| is exact text prescribed? | no — criteria says "throw clear error" |
| did we assume the text? | yes — the exact message is our choice |
| is this backwards compat? | no — this is new error message |
| could this break any item? | no — error messages can change |

**verdict**: not backwards compat concern. the error message is new content, not preservation of extant behavior.

---

### assumption 4: baseURL consistency

| question | analysis |
|----------|----------|
| what we use | `baseURL: 'https://api.x.ai/v1'` in both branches |
| is this backwards compat? | no — extant code already uses this URL |
| did we add it for compat? | no — it's the correct xAI API URL |
| could we change it? | no — it's the xAI API endpoint |

**verdict**: not backwards compat concern. it's a technical requirement, not a compatibility choice.

---

### assumption 5: optional context parameter

| question | analysis |
|----------|----------|
| what we use | `context?:` (optional parameter) |
| why optional? | to allow `ask({ ... })` without context |
| is this prescribed? | yes — vision usecase 1 shows no context |
| what if required? | would break all extant code |
| did wisher explicitly say optional? | implicitly yes — usecase 1 code shows no context param |

**verdict**: implicitly prescribed. vision usecase 1 demonstrates `ask()` without context parameter.

---

### assumption 6: the `as OpenAI` cast

| question | analysis |
|----------|----------|
| what we use | `return context.openai as OpenAI;` |
| why the cast? | context.openai type is not narrowed |
| is this backwards compat? | no — it's typescript requirement |
| did we add it "to be safe"? | no — compilation requires it |
| could we remove it? | no — would cause type error |

**verdict**: not backwards compat. it's a type system constraint.

---

## issues found

none. after we examined 6 hidden assumptions:

| assumption | verdict |
|------------|---------|
| Empty type in union | explicitly prescribed |
| context.openai branch | implicitly prescribed |
| error message text | not compat concern |
| baseURL consistency | not compat concern |
| optional context param | implicitly prescribed |
| `as OpenAI` cast | not compat concern |

---

## key insight from r4

**how to distinguish true backwards compat from other concerns**

r4 reveals that not all items that "preserve behavior" are backwards compat decisions:

| type | examples |
|------|----------|
| true backwards compat | Empty type, context.openai branch, optional context |
| technical requirements | baseURL, `as OpenAI` cast |
| new content | error message text |

true backwards compat is: "did we keep this item to avoid breakage?"
technical requirement is: "did we do this because the system demands it?"
new content is: "did we add this item that didn't exist before?"

all true backwards compat concerns trace to vision or criteria. no "to be safe" assumptions found.

---

## open questions for wisher

none. all backwards compat decisions trace to explicit requirements.

---

## what r4 confirmed

6 hidden assumptions examined. all either:
1. explicitly prescribed by vision
2. implicitly prescribed by criteria usecase.7
3. not backwards compat concerns at all

the blueprint contains no unvalidated backwards compat assumptions.

