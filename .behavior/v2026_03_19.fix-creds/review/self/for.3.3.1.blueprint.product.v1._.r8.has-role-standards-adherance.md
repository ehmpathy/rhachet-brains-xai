# self-review r8: has-role-standards-adherance

## rule categories enumerated

briefs/ subdirectories relevant to this blueprint:

| category | relevance | why |
|----------|-----------|-----|
| code.prod/evolvable.procedures | high | IIFE pattern, (input, context) signature |
| code.prod/evolvable.domain.operations | high | genBrainAtom operation |
| code.prod/pitofsuccess.errors | high | BadRequestError usage |
| code.prod/pitofsuccess.procedures | high | immutable vars, idempotency |
| code.prod/pitofsuccess.typedefs | medium | type declarations |
| code.prod/readable.comments | medium | JSDoc format |
| code.test | medium | test patterns |

---

## rule.require.input-context-pattern

### rule says

> enforce procedure args: (input, context?)

### blueprint adherance

```ts
ask()
├─ input                                 [○] retain
├─ context                               [~] update
```

genBrainAtom uses (input, context?) pattern already. blueprint extends context type, preserves pattern.

**verdict**: adheres.

---

## rule.require.immutable-vars

### rule says

> require immutable variables; mutation is blocker

### blueprint adherance

```ts
const openai: OpenAI = await (async () => { ... })();
```

IIFE pattern assigns to const. no let, no mutation.

**why IIFE?** early versions had `let openai; if (...) openai = ...; else openai = ...;` — mutation pattern. IIFE enables const assignment via early returns.

**verdict**: adheres. IIFE satisfies immutable-vars.

---

## rule.require.fail-fast

### rule says

> use BadRequestError.throw for invalid input

### blueprint adherance

```ts
apiKey: creds?.XAI_API_KEY ?? BadRequestError.throw('creds getter returned undefined XAI_API_KEY')
```

```ts
throw new BadRequestError('XAI_API_KEY required — provide via context or env');
```

both use BadRequestError for fail-fast on invalid state.

**verdict**: adheres.

---

## rule.forbid.io-as-domain-objects

### rule says

> forbid domain objects for procedure inputs and outputs; declare them inline

### blueprint adherance

```ts
context?: { 'brain.supplier.xai': BrainSuppliesXai } | Empty
```

context type is inline union, not a separate domain object.

BrainSuppliesXai is a type alias, not a DomainLiteral or DomainEntity.

**verdict**: adheres. no domain objects for IO.

---

## rule.require.what-why-headers

### rule says

> require .what and .why comments for every named procedure

### blueprint adherance

```ts
/**
 * .what = supplies for xai brain supplier
 * .why = enables credential injection without plaintext storage
 */
export type BrainSuppliesXai = { ... };
```

type declaration has .what/.why JSDoc.

**verdict**: adheres.

---

## rule.require.get-set-gen-verbs

### rule says

> all domain operations use exactly one: get, set, or gen

### blueprint adherance

genBrainAtom — uses `gen` prefix. no change to operation name.

**verdict**: adheres.

---

## rule.forbid.barrel-exports

### rule says

> never do barrel exports; index.ts only for public package entrypoint

### blueprint adherance

sdk/index.ts — is public package entrypoint. allowed.

```ts
export { BrainSuppliesXai } from '../domain.operations/atom/genBrainAtom';
```

single export, not barrel re-export.

**verdict**: adheres.

---

## rule.require.arrow-only

### rule says

> enforce arrow functions for procedures; disallow function keyword

### blueprint adherance

IIFE uses arrow function:
```ts
await (async () => { ... })();
```

**verdict**: adheres.

---

## rule.require.given-when-then

### rule says

> use jest with test-fns for given/when/then tests

### blueprint adherance

test file will use given/when/then from test-fns. blueprint specifies:
> test style: given/when/then from test-fns

**verdict**: adheres.

---

## issues found

none. blueprint follows all relevant mechanic role standards.

---

## summary

| rule | category | status |
|------|----------|--------|
| input-context-pattern | procedures | adheres |
| immutable-vars | pit of success | adheres (IIFE) |
| fail-fast | pit of success | adheres (BadRequestError) |
| io-as-domain-objects | procedures | adheres (inline type) |
| what-why-headers | comments | adheres |
| get-set-gen-verbs | operations | adheres (gen prefix) |
| barrel-exports | repo structure | adheres (sdk entrypoint) |
| arrow-only | procedures | adheres |
| given-when-then | tests | adheres |

**blueprint follows mechanic role standards.**

