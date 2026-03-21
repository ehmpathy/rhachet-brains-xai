# self-review r7: has-behavior-declaration-coverage (deep)

## re-read with fresh eyes

r6 showed coverage tables. r7 reads each vision section line by line and verifies.

---

## vision: "the outcome world" section

### vision text: "before" block

```
// credentials hardcoded to env vars
// every call reads process.env.XAI_API_KEY
// plaintext credentials float through call stacks
// no way to inject credentials from a vault, secrets manager, or context
```

**question**: does blueprint address "no way to inject"?
**answer**: yes. the context parameter with creds getter enables injection.

**question**: does blueprint address "plaintext float through call stacks"?
**answer**: yes. getter returns fresh credentials, not stored.

---

### vision text: "after" block

```ts
const context = genContextBrainSupplier<'xai', BrainSuppliesXai>({
  creds: async () => ({ XAI_API_KEY: await keyrack.get(...) }),
});
```

**question**: does blueprint show this exact pattern?
**answer**: partial. blueprint shows the type shape but notes `genContextBrainSupplier` is from rhachet. r8 clarified: we inline the type shape now.

**question**: is this a gap?
**answer**: no. blueprint explicitly says "we use compatible shape now" and r8 resolved: inline `{ 'brain.supplier.xai': BrainSuppliesXai }`.

---

### vision text: benefits list

| benefit | blueprint addresses? | how |
|---------|---------------------|-----|
| "credentials never stored in plaintext" | yes | getter called fresh, not cached |
| "credentials sourced from any secrets manager" | yes | getter is user-defined |
| "credentials can be rotated without restart" | yes | no cache in implementation |
| "credentials scoped to specific operations" | yes | context is per-call |
| "fallback to env var for simple usecases" | yes | IIFE else branch |

**all 5 benefits addressed.**

---

## vision: "user experience" section

### usecase 1: simple local development

vision code:
```ts
const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
await atom.ask({ ... });
```

**question**: does blueprint preserve this path?
**answer**: yes. context is optional (`context?: ... | Empty`). env var fallback works.

---

### usecase 2: production with secrets manager

vision code:
```ts
const context = genContextBrainSupplier<'xai', BrainSuppliesXai>({
  creds: async () => ({
    XAI_API_KEY: await keyrack.get({ env: 'prod', key: 'XAI_API_KEY' }),
  }),
});
await atom.ask({ ... }, context);
```

**question**: does blueprint support this?
**answer**: yes. context with `brain.supplier.xai.creds` getter is checked first.

---

### usecase 3: multi-tenant credential isolation

vision code:
```ts
const getContextForCustomer = (input: { customerUuid: string }) =>
  genContextBrainSupplier<'xai', BrainSuppliesXai>({
    creds: async () => ({
      XAI_API_KEY: await keyrack.get({ owner: input.customerUuid, ... }),
    }),
  });
```

**question**: does blueprint support this?
**answer**: yes. different context per call enables isolation.

---

### usecase 4: tests without env pollution

vision code:
```ts
const context: ContextBrainSupplier<'xai', BrainSuppliesXai> = {
  'brain.supplier.xai': {
    creds: async () => ({ XAI_API_KEY: 'test-key-for-this-suite' }),
  },
};
```

**question**: does blueprint support this?
**answer**: yes. context injection works for tests.

---

## vision: "mental model" section

### type structure from vision

```ts
ContextBrainSupplier<TSupplierSlug, TSupplierSupplies> = {
  ['brain.supplier.' + TSupplierSlug]: TSupplierSupplies
}
```

**question**: does blueprint match this shape?
**answer**: yes. inline type is `{ 'brain.supplier.xai': BrainSuppliesXai }`.

---

## vision: "evaluation" section

### goal checklist from vision

| goal | vision says | blueprint status |
|------|-------------|-----------------|
| "support context-injected creds" | yes | covered |
| "avoid plaintext credentials" | yes | covered |
| "fallback to env vars" | yes | covered |
| "future-proof for rhachet lift" | yes | type is compatible |

---

### pit of success table from vision

| edgecase | vision handle | blueprint handle |
|----------|--------------|-----------------|
| "no context, no env var" | "throw clear error" | BadRequestError |
| "getter throws" | "propagate error" | async/await propagates |
| "getter returns undefined" | "fall back to env" | not explicitly handled |
| "creds cached vs fresh" | "always call getter" | no cache |
| "both context.openai and creds" | "creds > openai > env" | IIFE order |

**potential gap found**: "getter returns undefined" → vision says "fall back to env"

**examine blueprint**:
```ts
if (supplier?.creds) {
  const creds = await supplier.creds();
  return new OpenAI({ apiKey: creds.XAI_API_KEY, ... });
}
```

if getter returns `{ XAI_API_KEY: undefined }`, this would pass undefined to OpenAI client. the check `supplier?.creds` only checks if getter exists, not its return value.

**is this a gap?**

vision says: "getter returns undefined — treat as absent, fall back to env"

blueprint does not check `creds.XAI_API_KEY` before use.

**resolution needed?**

examine further: if getter returns undefined, OpenAI client will throw. the error will propagate with "authorization" message from OpenAI.

but vision says "fall back to env" — this means we should check the getter result.

**fix needed**:
```ts
if (supplier?.creds) {
  const creds = await supplier.creds();
  return new OpenAI({
    apiKey: creds?.XAI_API_KEY ?? BadRequestError.throw('creds getter returned undefined XAI_API_KEY'),
    ...
  });
}
```

**document fix**: blueprint should add fail-fast check for undefined XAI_API_KEY. returning undefined is a type violation — the getter contract says `Promise<{ XAI_API_KEY: string }>`, not `string | undefined`. fail fast exposes the violation early.

---

## issue found and fixed

| issue | location | fix |
|-------|----------|-----|
| getter that returns undefined not handled | IIFE creds branch | add BadRequestError.throw for undefined |

this fix has been applied to the blueprint.

---

## criteria coverage (quick re-verify)

all 8 usecases from 2.1.criteria.blackbox.md verified in r6. no changes needed for criteria — the fix above is from vision's pit of success table.

---

## summary

- **7 vision sections reviewed line by line**
- **4 usecases verified**
- **1 gap found**: undefined getter result handle
- **1 fix applied**: add `BadRequestError.throw` for undefined XAI_API_KEY

the fix has been applied to the blueprint. fail fast on type violations.

