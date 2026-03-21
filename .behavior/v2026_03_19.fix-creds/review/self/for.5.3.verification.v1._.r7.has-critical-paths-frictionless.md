# has-critical-paths-frictionless: self-review round 7

## i trace each critical path to verify frictionless operation

### context

this behavior is a feature addition, not a defect fix. the repros artifact (`3.2.distill.repros.experience.*.md`) does not exist.

for feature additions, critical paths derive from the vision usecases. i verify each path from vision is frictionless.

---

## critical path 1: simple local development (env var fallback)

### traced path

1. developer sets `XAI_API_KEY` env var
2. calls `genBrainAtom({ slug: 'xai/grok/code-fast-1' })`
3. calls `atom.ask({ ... })` without context
4. `getSdkXaiCreds` detects no supplier, reads `process.env.XAI_API_KEY`
5. api call succeeds

### verification

- **test file**: `genBrainAtom.integration.test.ts`
- **test cases**: all 10 cases run without context supplier
- **evidence**: line 22 creates atom, lines 44-50 call ask without context
- **result**: all tests pass (48 assertions via `npm run test:integration`)

### frictionless?

**yes** — developers need only set env var. no ceremony, no context, no imports.

code path:
```
ask() → getSdkXaiCreds({}, undefined) → process.env.XAI_API_KEY → OpenAI client
```

---

## critical path 2: production with context supplier

### traced path

1. create context with creds getter: `{ 'brain.supplier.xai': { creds: async () => ({ XAI_API_KEY: ... }) } }`
2. call `atom.ask({ ... }, context)`
3. `getSdkXaiCreds` detects supplier, calls getter
4. api call uses returned credentials

### verification

- **test file**: `genBrainAtom.credentials.integration.test.ts`
- **test case**: case1 (lines 27-56)
- **evidence**:
  - line 36: getter increments counter
  - line 52: `expect(getterCallCount).toBeGreaterThan(0)`
  - line 53: `expect(result.output).not.toBeNull()`
- **result**: test passes

### frictionless?

**yes** — single context object, one getter function. the `asContext()` helper is temporary (line 20 notes removal when rhachet exposes types).

code path:
```
ask() → getSdkXaiCreds({}, context) → context['brain.supplier.xai'].creds() → OpenAI client
```

---

## critical path 3: multi-tenant credential isolation

### traced path

1. create contextA with getter that returns keyA
2. create contextB with getter that returns keyB
3. call `atom.ask({ ... }, contextA)` → uses keyA
4. call `atom.ask({ ... }, contextB)` → uses keyB

### verification

- **test file**: `genBrainAtom.credentials.integration.test.ts`
- **test case**: case4 (lines 131-180)
- **evidence**:
  - lines 139-143: contextA getter pushes 'keyA'
  - lines 148-152: contextB getter pushes 'keyB'
  - line 177: `expect(apiKeysUsed).toEqual(['keyA', 'keyB'])`
- **result**: test passes

### frictionless?

**yes** — each context is independent. no shared state, no cross-contamination.

---

## critical path 4: tests without env pollution

### traced path

1. create context with test credentials
2. call `atom.ask({ ... }, context)`
3. test credentials used, env var ignored

### verification

- **test file**: `genBrainAtom.credentials.integration.test.ts`
- **all cases** inject credentials via context supplier
- **evidence**: lines 33-40 show context supplier construction
- **isolation**: each test creates its own context object
- **result**: all 4 cases pass

### frictionless?

**yes** — tests inject credentials at call site. no `process.env` manipulation needed.

---

## critical path 5: credential getter called fresh per ask

### traced path

1. create context with counter in getter
2. call `atom.ask()` twice
3. getter invoked twice (not cached)

### verification

- **test file**: `genBrainAtom.credentials.integration.test.ts`
- **test case**: case2 (lines 58-99)
- **evidence**:
  - line 96: `expect(countAfterFirst).toEqual(1)`
  - line 97: `expect(countAfterSecond).toEqual(2)`
- **result**: test passes

### frictionless?

**yes** — getter is called fresh per ask. users who want cache wrap their getter.

---

## critical path 6: getter error propagation

### traced path

1. create context with getter that throws
2. call `atom.ask({ ... }, context)`
3. error propagates to caller

### verification

- **test file**: `genBrainAtom.credentials.integration.test.ts`
- **test case**: case3 (lines 102-128)
- **evidence**:
  - line 108: getter throws `new Error('vault unreachable')`
  - line 126: `expect(error.message).toContain('vault unreachable')`
- **result**: test passes

### frictionless?

**yes** — errors surface with original message. not swallowed, not obfuscated.

---

## edgecase coverage

### getter returns undefined

- **test file**: `getSdkXaiCreds.test.ts`
- **test case**: case3 (lines 44-58)
- **evidence**: line 55 — `expect(error.message).toContain('creds getter returned undefined')`
- **frictionless**: clear error message guides resolution

### no supplier and no env var

- **test file**: `getSdkXaiCreds.test.ts`
- **test case**: case4 (lines 60-68)
- **evidence**: line 66 — `expect(error.message).toContain('XAI_API_KEY required')`
- **frictionless**: clear error message guides resolution

---

## summary

| critical path | test file | test case | frictionless |
|---------------|-----------|-----------|--------------|
| env var fallback | genBrainAtom.integration.test.ts | all | yes |
| context supplier | credentials.integration.test.ts | case1 | yes |
| multi-tenant | credentials.integration.test.ts | case4 | yes |
| tests w/o env pollution | credentials.integration.test.ts | all | yes |
| fresh per ask | credentials.integration.test.ts | case2 | yes |
| error propagation | credentials.integration.test.ts | case3 | yes |
| getter undefined | getSdkXaiCreds.test.ts | case3 | yes |
| no creds | getSdkXaiCreds.test.ts | case4 | yes |

---

## verdict

all critical paths are frictionless:

1. **env var fallback**: zero-ceremony for local development
2. **context supplier**: single object, one getter function
3. **multi-tenant**: independent contexts, no shared state
4. **test isolation**: inject at call site, no env manipulation
5. **fresh per ask**: no hidden cache, user controls cache
6. **error propagation**: original errors surface to caller
7. **clear error messages**: guide users to resolution

the credential supplier feature "just works" across all usecases.

