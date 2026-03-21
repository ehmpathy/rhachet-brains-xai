# self-review r6: has-consistent-conventions

## deeper convention examination

r5 examined type names, function names, and JSDoc. r6 digs into subtler conventions: error messages, comment styles, and file structure.

---

## error message conventions

### extant error message

```ts
// genBrainAtom.integration.test.ts:16
throw new BadRequestError('XAI_API_KEY is required for integration tests');
```

### blueprint error message

```ts
throw new BadRequestError('XAI_API_KEY required — provide via context or env');
```

| aspect | extant (test) | blueprint (prod) | analysis |
|--------|---------------|------------------|----------|
| message style | `X is required for Y` | `X required — action` | different but both clear |
| context | test guard | runtime error | different context |
| em-dash | not used | used | stylistic choice |

**verdict**: not a convention violation. the contexts are different:
- test: "required for tests" tells dev to set env var
- prod: "provide via context or env" tells dev how to fix

the messages serve different purposes. both are clear.

---

## comment style conventions

### extant inline comments

```ts
// genBrainAtom.ts:65
// track start time for elapsed duration

// genBrainAtom.ts:73
// get openai client from context or create new one with xai baseURL
```

pattern: lowercase, no period, describes what follows

### blueprint inline comments

```ts
// get openai client with precedence: creds getter > context.openai > env var

// creds getter present: create fresh client with getter creds

// use context-provided client

// fallback to env var
```

| aspect | extant | blueprint | consistent? |
|--------|--------|-----------|-------------|
| case | lowercase | lowercase | yes |
| punctuation | no period | no period (mostly) | yes |
| style | describes what | describes what | yes |

**verdict**: consistent. blueprint follows extant comment style.

---

## file structure conventions

### extant test files

| file | pattern |
|------|---------|
| `genBrainAtom.integration.test.ts` | `{operation}.integration.test.ts` |
| `genBrainAtom.truncation.integration.test.ts` | `{operation}.{aspect}.integration.test.ts` |

### blueprint test file

| file | pattern |
|------|---------|
| `genBrainAtom.credentials.integration.test.ts` | `{operation}.{aspect}.integration.test.ts` |

**verdict**: consistent. follows `{operation}.{aspect}.integration.test.ts` pattern.

---

## import conventions

### extant imports

```ts
import { BadRequestError, UnexpectedCodePathError } from 'helpful-errors';
import OpenAI from 'openai';
import type { Empty } from 'type-fns';
```

### blueprint imports

adds: `import { BadRequestError } from 'helpful-errors';`

| aspect | extant | blueprint | consistent? |
|--------|--------|-----------|-------------|
| error import | from helpful-errors | from helpful-errors | yes |
| type imports | `import type` | `import type` | yes |

**verdict**: consistent. blueprint uses extant import patterns.

---

## variable name conventions within functions

### extant local variables

```ts
const startedAt = Date.now();
const systemPrompt = ...;
const openai = ...;
const tools = ...;
const messages = ...;
const response = ...;
```

pattern: camelCase, descriptive nouns

### blueprint local variables

```ts
const supplier = context?.['brain.supplier.xai'];
const creds = await supplier.creds();
const apiKey = process.env.XAI_API_KEY;
const openai = ...;
```

| variable | convention | consistent? |
|----------|------------|-------------|
| `supplier` | camelCase noun | yes |
| `creds` | camelCase noun | yes |
| `apiKey` | camelCase noun | yes |
| `openai` | matches extant | yes |

**verdict**: consistent. all local variables follow extant camelCase noun pattern.

---

## issues found

none. after we examined 5 subtle convention areas:

| area | status |
|------|--------|
| error messages | different context, appropriate |
| comment style | consistent |
| file structure | consistent |
| import patterns | consistent |
| local variable names | consistent |

---

## key insight from r6

**context-appropriate divergence is not convention violation**

the error message difference is intentional:
- test context: "required for tests" (diagnosis)
- prod context: "provide via context or env" (solution)

different contexts call for different messages. this is good design, not inconsistency.

---

## what r6 added to r5

r5 examined macro conventions (type names, function names). r6 examined micro conventions:
- error message patterns
- inline comment style
- file structure patterns
- import order
- local variable names

all consistent. no violations found.

