# self-review r7: has-behavior-declaration-adherance

## adherance check

r7 (adherance) checks that blueprint correctly implements what vision/criteria describe — not just covers, but matches correctly.

---

## vision adherance: type shape

### vision describes

```ts
ContextBrainSupplier<TSupplierSlug, TSupplierSupplies> = {
  ['brain.supplier.' + TSupplierSlug]: TSupplierSupplies
}
```

### blueprint implements

```ts
{ 'brain.supplier.xai': BrainSuppliesXai }
```

**adherance check**: substitute `TSupplierSlug = 'xai'` and `TSupplierSupplies = BrainSuppliesXai`:
- `['brain.supplier.' + 'xai']` = `'brain.supplier.xai'`
- result: `{ 'brain.supplier.xai': BrainSuppliesXai }`

**verdict**: exact match. blueprint adheres.

---

## vision adherance: getter signature

### vision describes

```ts
creds: async () => ({ XAI_API_KEY: await keyrack.get(...) })
```

### blueprint implements

```ts
creds: () => Promise<{ XAI_API_KEY: string }>
```

**adherance check**: vision shows async function, blueprint shows `() => Promise`. async functions return Promise. types match.

**verdict**: adheres correctly.

---

## vision adherance: precedence order

### vision describes

> precedence: creds getter > openai client > env var

### blueprint implements

```ts
if (supplier?.creds) { ... return ... }  // first
if (context?.openai) { ... return ... }  // second
// env var                               // third
```

**adherance check**: IIFE branch order matches exactly.

**verdict**: adheres correctly.

---

## vision adherance: error message

### vision describes

> "XAI_API_KEY required — provide via context or env"

### blueprint implements

```ts
throw new BadRequestError('XAI_API_KEY required — provide via context or env');
```

**adherance check**: exact string match.

**verdict**: adheres correctly.

---

## criteria adherance: usecase.7 precedence

### criteria describes

> "creds getter takes precedence over openai client"
> "openai client takes precedence over env var"

### blueprint implements

IIFE branches: creds → openai → env

**adherance check**: order matches criteria exactly.

**verdict**: adheres correctly.

---

## criteria adherance: usecase.2 NOT read process.env

### criteria describes

> "should NOT read process.env.XAI_API_KEY" when creds getter present

### blueprint implements

```ts
if (supplier?.creds) {
  const creds = await supplier.creds();
  return new OpenAI({
    apiKey: creds?.XAI_API_KEY ?? BadRequestError.throw(...),
    ...
  });
}
```

**adherance check**: early return after creds branch. env var code unreachable when creds getter present.

**verdict**: adheres correctly.

---

## criteria adherance: usecase.3 fresh per ask

### criteria describes

> "creds getter should be called each time"

### blueprint implements

IIFE runs inside ask() body. no cache. getter called every ask().

**adherance check**: no memoization or cache in implementation.

**verdict**: adheres correctly.

---

## found issues

none. blueprint adheres to vision and criteria correctly.

---

## why it holds

| check | why it holds |
|-------|--------------|
| type shape | exact structural match with generic substitution |
| getter signature | async → Promise equivalence |
| precedence order | IIFE branch order matches exactly |
| error message | exact string match |
| NOT read env | early return prevents env access |
| fresh per ask | no cache, IIFE runs every call |

**blueprint correctly implements what vision and criteria describe.**

---

## key insight

> adherance means "implements correctly", not just "covers"

r6-r8 checked coverage (does blueprint address all requirements?).
r7 (adherance) checks correctness (does blueprint implement them right?).

both dimensions verified. blueprint adheres.

