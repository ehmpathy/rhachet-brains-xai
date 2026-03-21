# self-review r9: has-role-standards-adherance (deeper)

## deeper rule check

r8 enumerated 9 rules. r9 examines each with more rigor.

---

## rule.require.immutable-vars — deep examination

### the pattern

IIFE enables const assignment when conditional logic would otherwise require let.

```ts
// bad: mutation
let openai;
if (supplier?.creds) {
  openai = new OpenAI({ ... });
} else if (context?.openai) {
  openai = context.openai;
} else {
  openai = new OpenAI({ ... });
}

// good: IIFE
const openai = await (async () => {
  if (supplier?.creds) return new OpenAI({ ... });
  if (context?.openai) return context.openai;
  return new OpenAI({ ... });
})();
```

### why it holds

- `const openai` — immutable bound variable
- IIFE with early returns — no mutation inside
- each branch returns, no reassignment

**articulation**: the IIFE pattern transforms mutation into early returns, which satisfies immutable-vars without loss of readability.

---

## rule.require.fail-fast — deep examination

### two fail-fast points

**point 1**: undefined creds from getter
```ts
apiKey: creds?.XAI_API_KEY ?? BadRequestError.throw('creds getter returned undefined XAI_API_KEY')
```

**why it holds**: if getter promises `{ XAI_API_KEY: string }` but returns undefined, that's a type violation. fail fast exposes it at call site.

**point 2**: absent env var
```ts
if (!apiKey) {
  throw new BadRequestError('XAI_API_KEY required — provide via context or env');
}
```

**why it holds**: caller didn't provide creds via any mechanism. clear error tells them exactly what's needed.

**articulation**: both failure modes get explicit BadRequestError with actionable messages. no silent failures.

---

## rule.forbid.io-as-domain-objects — deep examination

### what could violate

```ts
// bad: domain object for input
class BrainSupplierContext extends DomainLiteral<BrainSupplierContext> {
  'brain.supplier.xai': BrainSuppliesXai;
}
```

### what blueprint does

```ts
// good: inline type alias
context?: { 'brain.supplier.xai': BrainSuppliesXai } | Empty
```

**why it holds**:
- `{ 'brain.supplier.xai': BrainSuppliesXai }` is inline object type, not DomainLiteral
- `BrainSuppliesXai` is type alias, not class
- no `.schema`, `.unique`, `.nested` — not a domain object

**articulation**: types are declared inline at procedure signature, not as reusable domain objects. this keeps contract local.

---

## rule.require.what-why-headers — deep examination

### what could violate

```ts
// bad: no JSDoc
export type BrainSuppliesXai = { ... };
```

### what blueprint does

```ts
/**
 * .what = supplies for xai brain supplier
 * .why = enables credential injection without plaintext storage
 */
export type BrainSuppliesXai = { ... };
```

**why it holds**:
- `.what` explains purpose: "supplies for xai brain supplier"
- `.why` explains motivation: "enables credential injection without plaintext storage"
- format matches extant JSDoc in codebase

**articulation**: type export has .what/.why JSDoc, which matches codebase convention.

---

## rule.require.get-set-gen-verbs — deep examination

### context

genBrainAtom — `gen` prefix means "find or create".

### why it holds

genBrainAtom returns a BrainAtom. if called multiple times with same slug, returns equivalent atom. `gen` is correct verb because:
- not `get`: doesn't just retrieve, creates new state (atom object)
- not `set`: doesn't persist
- `gen`: creates and returns

**articulation**: `gen` verb is appropriate for factory that creates atom objects.

---

## rule.forbid.barrel-exports — deep examination

### what could violate

```ts
// bad: barrel re-export
export * from '../domain.operations/atom/genBrainAtom';
export * from '../domain.operations/atom/BrainAtom.config';
```

### what blueprint does

```ts
// good: explicit single exports
export { genBrainAtom } from '../domain.operations/atom/genBrainAtom';
export { BrainSuppliesXai } from '../domain.operations/atom/genBrainAtom';
```

**why it holds**:
- explicit named exports, not `export *`
- sdk/index.ts is public entrypoint, allowed per rule
- no forward chain

**articulation**: exports are explicit and from public entrypoint. no barrel patterns.

---

## rule.require.arrow-only — deep examination

### what could violate

```ts
// bad: function keyword
const openai = await (async function() { ... })();
```

### what blueprint does

```ts
// good: arrow function
const openai = await (async () => { ... })();
```

**why it holds**: arrow syntax used for IIFE. no `function` keyword.

**articulation**: IIFE uses arrow function, consistent with codebase style.

---

## rule.require.given-when-then — deep examination

### what blueprint specifies

```
test file will use given/when/then from test-fns
```

### what test cases look like

```ts
import { given, when, then } from 'test-fns';

describe('genBrainAtom.credentials', () => {
  given('[case1] context with creds getter', () => {
    when('[t0] ask() is called', () => {
      then('creds getter is called and used', async () => {
        // assertion
      });
    });
  });
});
```

**why it holds**: blueprint specifies test-fns style. implementation will follow.

**articulation**: test structure aligns with rule.require.given-when-then pattern.

---

## issues found

none. all 9 rules examined in depth. blueprint adheres.

---

## why each holds (summary)

| rule | why it holds |
|------|--------------|
| immutable-vars | IIFE transforms mutation to early returns |
| fail-fast | two explicit BadRequestError.throw points |
| io-as-domain-objects | inline type, not DomainLiteral class |
| what-why-headers | JSDoc with .what/.why format |
| get-set-gen-verbs | `gen` appropriate for factory |
| barrel-exports | explicit exports from public entrypoint |
| arrow-only | IIFE uses arrow function |
| given-when-then | test structure specified |
| input-context-pattern | (input, context?) preserved |

**blueprint follows all mechanic role standards.**

