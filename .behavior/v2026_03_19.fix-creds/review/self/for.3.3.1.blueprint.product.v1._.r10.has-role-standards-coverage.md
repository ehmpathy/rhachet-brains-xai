# self-review r10: has-role-standards-coverage (deeper)

## briefs/ subdirectories enumerated

### relevant rule categories

| category | relevance | why |
|----------|-----------|-----|
| code.prod/evolvable.procedures | high | IIFE pattern, (input, context) signature |
| code.prod/evolvable.domain.operations | high | genBrainAtom operation |
| code.prod/pitofsuccess.errors | high | BadRequestError usage |
| code.prod/pitofsuccess.procedures | high | immutable vars, idempotency |
| code.prod/pitofsuccess.typedefs | medium | type declarations |
| code.prod/readable.comments | medium | JSDoc format |
| code.test | high | integration tests |
| code.prod/readable.narrative | low | IIFE branches |
| code.prod/evolvable.repo.structure | low | sdk/index.ts exports |

### not relevant

| category | why not |
|----------|---------|
| lang.terms | no new terms introduced |
| lang.tones | no user-faced prose |
| work.flow | no workflow changes |

---

## coverage check by category

### code.prod/evolvable.procedures

| rule | present? | where/why |
|------|----------|-----------|
| rule.require.input-context-pattern | yes | ask(input, context?) signature |
| rule.forbid.positional-args | yes | named args only |
| rule.require.arrow-only | yes | IIFE uses arrow function |
| rule.require.dependency-injection | yes | creds via context |
| rule.forbid.io-as-domain-objects | yes | inline type union |
| rule.require.hook-wrapper-pattern | n/a | no hooks involved |

**coverage**: complete

### code.prod/evolvable.domain.operations

| rule | present? | where/why |
|------|----------|-----------|
| rule.require.get-set-gen-verbs | yes | gen prefix on genBrainAtom |
| rule.require.sync-filename-opname | yes | genBrainAtom.ts exports genBrainAtom |

**coverage**: complete

### code.prod/pitofsuccess.errors

| rule | present? | where/why |
|------|----------|-----------|
| rule.require.fail-fast | yes | two BadRequestError.throw points |
| rule.forbid.failhide | yes | no try/catch that swallows |
| rule.prefer.helpful-error-wrap | n/a | getter errors propagate directly |

**coverage**: complete

### code.prod/pitofsuccess.procedures

| rule | present? | where/why |
|------|----------|-----------|
| rule.require.immutable-vars | yes | IIFE for const openai |
| rule.require.idempotent-procedures | n/a | ask() is read operation |
| rule.forbid.nonidempotent-mutations | n/a | no mutations |

**coverage**: complete

### code.prod/pitofsuccess.typedefs

| rule | present? | where/why |
|------|----------|-----------|
| rule.require.shapefit | yes | types fit without cast |
| rule.forbid.as-cast | yes | no as casts in blueprint |

**coverage**: complete

### code.prod/readable.comments

| rule | present? | where/why |
|------|----------|-----------|
| rule.require.what-why-headers | yes | JSDoc on BrainSuppliesXai |

**coverage**: complete

### code.test

| rule | present? | where/why |
|------|----------|-----------|
| rule.require.given-when-then | yes | test structure specified |
| rule.forbid.redundant-expensive-operations | yes | one api call per test |
| rule.require.blackbox | yes | tests via ask() contract |

**coverage**: complete

---

## line-by-line coverage gaps

checked blueprint section by section:

### type declarations section

```ts
export type BrainSuppliesXai = {
  creds: () => Promise<{ XAI_API_KEY: string }>;
};
```

| check | result |
|-------|--------|
| JSDoc with .what/.why | yes — specified |
| no domain object | yes — type alias |
| clear type shape | yes — getter returns promise |

**no gaps**

### context type section

```ts
context?: ContextBrainSupplier<'xai', BrainSuppliesXai> | Empty
```

| check | result |
|-------|--------|
| inline IO type | yes — union inline |
| optional context | yes — ? suffix |

**no gaps**

### openai client creation section

```ts
const openai: OpenAI = await (async () => {
  // branches...
})();
```

| check | result |
|-------|--------|
| immutable var | yes — const via IIFE |
| arrow function | yes — async () => |
| fail-fast | yes — two BadRequestError points |

**no gaps**

### test coverage section

| check | result |
|-------|--------|
| integration tests | yes — 4 cases |
| given/when/then | yes — specified |
| covers criteria usecases | yes — maps to 1,2,3,4,6 |

**no gaps**

### documentation section

| check | result |
|-------|--------|
| README usecases | yes — 4 specified |
| cache recommendation | yes — with-simple-cache |

**no gaps**

---

## absent patterns found

**none.** all relevant mechanic standards are covered:

| category | status |
|----------|--------|
| evolvable.procedures | complete |
| evolvable.domain.operations | complete |
| pitofsuccess.errors | complete |
| pitofsuccess.procedures | complete |
| pitofsuccess.typedefs | complete |
| readable.comments | complete |
| code.test | complete |

---

## why coverage holds

1. **error handle**: two explicit BadRequestError.throw points cover both failure modes (undefined creds, absent env var)

2. **validation**: context?.['brain.supplier.xai']?.creds check validates before use

3. **tests**: 4 integration test cases map to criteria usecases 2,3,4,6; usecase 1 covered by extant tests

4. **types**: BrainSuppliesXai exported, inline context type, no domain objects for IO

5. **documentation**: README usecases and cache recommendation specified

**blueprint has complete role standards coverage.**

