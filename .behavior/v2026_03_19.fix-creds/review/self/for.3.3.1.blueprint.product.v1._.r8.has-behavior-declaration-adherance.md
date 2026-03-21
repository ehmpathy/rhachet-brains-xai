# self-review r8: has-behavior-declaration-adherance (deeper)

## deeper adherance verification

r7 checked 6 adherance points. r8 examines potential drift areas more closely.

---

## potential drift area 1: usecase 4 multi-tenant isolation

### criteria says

> "context A → customer A credentials"
> "context B → customer B credentials"

### what could drift

a junior might share state between calls, cache credentials globally, or reuse OpenAI client instances.

### blueprint adherance

```ts
const openai: OpenAI = await (async () => {
  const supplier = context?.['brain.supplier.xai'];
  if (supplier?.creds) {
    const creds = await supplier.creds();
    return new OpenAI({ ... });
  }
  ...
})();
```

**adherance check**:
- IIFE creates fresh `openai` client per `ask()` call
- `supplier` is derived from `context`, not global state
- `creds` is called fresh, returns context-specific credentials
- no shared state between calls

**verdict**: adheres. multi-tenant isolation preserved by per-call client creation.

---

## potential drift area 2: documentation usecases

### vision says

> "root README.md must include credential supplier documentation with these usecases:
> 1. simple local development
> 2. production with secrets manager
> 3. multi-tenant credential isolation
> 4. tests without env pollution"

### blueprint says

> "add section 'credential supplier' with usecases:
> 1. simple local development (env var fallback)
> 2. production with secrets manager (`genContextBrainSupplier` pattern)
> 3. multi-tenant credential isolation
> 4. tests without env pollution"

**adherance check**: all 4 usecases listed. exact match.

**verdict**: adheres.

---

## potential drift area 3: cache recommendation

### vision says

> "include cache recommendation with `with-simple-cache` + `simple-in-memory-cache`"

### blueprint says

> "include cache recommendation with `with-simple-cache` + `simple-in-memory-cache`"

**adherance check**: exact match.

**verdict**: adheres.

---

## potential drift area 4: test coverage

### vision implies

tests should cover credential supplier behavior.

### blueprint specifies

```
| case | description | verifies |
|------|-------------|----------|
| 1 | context with creds getter succeeds | creds getter is called and used |
| 2 | getter called fresh per ask | call count increments per ask |
| 3 | getter error propagates | error message contains getter error |
| 4 | multi-tenant isolation | different contexts = different creds |
```

**adherance check**:
- case 1 verifies usecase.2 (production context)
- case 2 verifies usecase.3 (fresh per ask)
- case 3 verifies usecase.6 (error propagation)
- case 4 verifies usecase.4 (multi-tenant)

env var fallback (usecase.1) covered by extant tests.

**verdict**: adheres. test coverage maps to criteria usecases.

---

## potential drift area 5: type export

### vision says

> "export `BrainSuppliesXai` type for consumers"

### blueprint specifies

sdk/index.ts export:
```
export BrainSuppliesXai                  [+] create
```

genBrainAtom.ts re-export:
```
re-export BrainSuppliesXai               [+] create
```

**adherance check**: type exported from both genBrainAtom.ts and sdk/index.ts. consumers can import from either.

**verdict**: adheres.

---

## what i looked for

| area | drift risk | found drift? |
|------|------------|--------------|
| multi-tenant state | shared state between calls | no — per-call IIFE |
| documentation usecases | absent usecase | no — all 4 listed |
| cache recommendation | wrong packages | no — exact match |
| test coverage | absent criterion | no — all mapped |
| type export | absent export | no — exported from both files |

---

## why adherance holds

**the blueprint is a faithful implementation of vision and criteria because:**

1. **per-call isolation** — IIFE runs fresh each ask(), no shared state
2. **documentation complete** — all 4 usecases listed with correct packages
3. **test coverage mapped** — each test case ties to a criterion
4. **exports correct** — type exported from public API surface

no drift found. blueprint adheres to behavior declaration.

---

## key insight

> check for drift in shared state, documentation completeness, and export correctness.

these are common drift areas for juniors:
- global caches instead of per-call
- absent usecases in docs
- forgot public exports

blueprint avoids all three.

