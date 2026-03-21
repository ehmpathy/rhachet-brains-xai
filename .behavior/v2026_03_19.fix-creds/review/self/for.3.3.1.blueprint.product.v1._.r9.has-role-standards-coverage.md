# self-review r9: has-role-standards-coverage

## coverage check

r9 (coverage) checks for absent patterns — standards that should be present but are not.

---

## mechanic standards checklist

| standard | present? | where |
|----------|----------|-------|
| rule.require.input-context-pattern | yes | ask(input, context?) |
| rule.require.immutable-vars | yes | IIFE for const openai |
| rule.require.fail-fast | yes | BadRequestError.throw x2 |
| rule.forbid.io-as-domain-objects | yes | inline type, not DomainLiteral |
| rule.require.what-why-headers | yes | JSDoc on BrainSuppliesXai |
| rule.require.get-set-gen-verbs | yes | gen prefix on genBrainAtom |
| rule.forbid.barrel-exports | yes | explicit exports only |
| rule.require.arrow-only | yes | IIFE uses arrow |
| rule.require.given-when-then | yes | test structure specified |
| rule.require.dependency-injection | yes | context for credentials |
| rule.require.idempotent-procedures | n/a | ask() is read operation |
| rule.require.single-responsibility | yes | one type, one change |

---

## absent pattern check

### error handle

| pattern | required? | present? |
|---------|-----------|----------|
| fail-fast on invalid input | yes | yes — BadRequestError for absent XAI_API_KEY |
| fail-fast on type violation | yes | yes — BadRequestError for undefined creds |
| error propagation | yes | yes — getter errors propagate |

**coverage**: complete

### validation

| pattern | required? | present? |
|---------|-----------|----------|
| input validation | no | n/a — no new input params |
| context validation | yes | yes — checks supplier?.creds |
| runtime type check | yes | yes — ?? BadRequestError.throw |

**coverage**: complete

### tests

| pattern | required? | present? |
|---------|-----------|----------|
| integration tests | yes | yes — 4 cases specified |
| unit tests | no | no — thin wrapper, not needed |
| env var fallback test | yes | yes — covered by extant tests |

**coverage**: complete

### types

| pattern | required? | present? |
|---------|-----------|----------|
| export public types | yes | yes — BrainSuppliesXai |
| inline IO types | yes | yes — context union inline |
| avoid domain objects for IO | yes | yes — type alias, not class |

**coverage**: complete

### documentation

| pattern | required? | present? |
|---------|-----------|----------|
| JSDoc on exports | yes | yes — .what/.why on type |
| README usecases | yes | yes — 4 usecases specified |
| cache recommendation | yes | yes — with-simple-cache |

**coverage**: complete

---

## potential absent patterns

### considered but not needed

| pattern | why not needed |
|---------|----------------|
| log methods | no log context in scope |
| retry logic | caller controls |
| cache | caller controls via getter |
| schema validation | getter returns typed Promise |

### would be over-engineer

| pattern | why excessive |
|---------|---------------|
| separate validation file | one ?? check suffices |
| separate error types | BadRequestError is correct |
| credential rotation event | caller controls getter |

---

## summary

all relevant mechanic standards are present in blueprint:

| category | coverage |
|----------|----------|
| error handle | complete |
| validation | complete |
| tests | complete |
| types | complete |
| documentation | complete |
| code style | complete |

**no absent patterns found.** blueprint has complete role standards coverage.

