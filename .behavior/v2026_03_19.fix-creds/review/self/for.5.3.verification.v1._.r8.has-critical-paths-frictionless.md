# has-critical-paths-frictionless: self-review round 8

## i trace each critical path through actual code execution

### context

this behavior is a feature addition, not a defect fix. the repros artifact (`3.2.distill.repros.experience.*.md`) does not exist.

for feature additions, critical paths derive from vision usecases. i manually trace each path through the implementation.

---

## critical path 1: simple local development (env var fallback)

### i trace the code execution

1. **developer creates atom** (genBrainAtom.ts:43)
   ```ts
   const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
   ```
   config is retrieved from `CONFIG_BY_ATOM_SLUG` (line 44).

2. **developer calls ask without context** (genBrainAtom.ts:59-68)
   ```ts
   await atom.ask({
     role: {},
     prompt: 'hello world',
     schema: { output: z.object({ message: z.string() }) },
   });
   // context is undefined
   ```

3. **credential resolution** (genBrainAtom.ts:78)
   ```ts
   const creds = await getSdkXaiCreds({}, context);
   // context is undefined here
   ```

4. **getSdkXaiCreds handles undefined context** (getSdkXaiCreds.ts:15-18)
   ```ts
   const supplier = context?.['brain.supplier.xai'];
   // supplier is undefined

   if (supplier?.creds) {
     // skipped — no supplier
   }
   ```

5. **env var fallback** (getSdkXaiCreds.ts:27-34)
   ```ts
   const apiKey = process.env.XAI_API_KEY;
   if (!apiKey) {
     throw new BadRequestError('XAI_API_KEY required — provide via context or env');
   }
   return { XAI_API_KEY: apiKey };
   ```

6. **OpenAI client created** (genBrainAtom.ts:81-84)
   ```ts
   const openai = new OpenAI({
     apiKey: creds.XAI_API_KEY,  // from env var
     baseURL: 'https://api.x.ai/v1',
   });
   ```

### why it holds

- **zero imports required**: developers do not need to import `BrainSuppliesXai` or any context types
- **zero context construction**: `ask()` works without second argument
- **single env var**: only `XAI_API_KEY` needed
- **clear error on absence**: message says "XAI_API_KEY required — provide via context or env"

### test verification

- `genBrainAtom.integration.test.ts` line 22: creates atom
- lines 44-50: calls ask without context
- 10 test cases (48 assertions) all pass

---

## critical path 2: production with context supplier

### i trace the code execution

1. **developer creates context**
   ```ts
   const context = {
     'brain.supplier.xai': {
       creds: async () => ({
         XAI_API_KEY: await vault.get('XAI_API_KEY'),
       }),
     },
   };
   ```

2. **developer calls ask with context** (genBrainAtom.ts:67)
   ```ts
   await atom.ask({ ... }, context);
   // context has 'brain.supplier.xai'
   ```

3. **credential resolution** (genBrainAtom.ts:78)
   ```ts
   const creds = await getSdkXaiCreds({}, context);
   ```

4. **getSdkXaiCreds detects supplier** (getSdkXaiCreds.ts:15-18)
   ```ts
   const supplier = context?.['brain.supplier.xai'];
   // supplier = { creds: async () => ... }

   if (supplier?.creds) {
     // enters this branch
   }
   ```

5. **getter is invoked** (getSdkXaiCreds.ts:19-24)
   ```ts
   const creds = await supplier.creds();
   return {
     XAI_API_KEY:
       creds?.XAI_API_KEY ??
       BadRequestError.throw('creds getter returned undefined XAI_API_KEY'),
   };
   ```

6. **OpenAI client created with supplier creds** (genBrainAtom.ts:81-84)
   ```ts
   const openai = new OpenAI({
     apiKey: creds.XAI_API_KEY,  // from getter
     baseURL: 'https://api.x.ai/v1',
   });
   ```

### why it holds

- **single object**: context is `{ 'brain.supplier.xai': { creds: () => ... } }`
- **async getter**: credentials fetched just-in-time
- **env var ignored**: code path exits at line 24, never reaches env fallback
- **clear error on undefined**: getter that returns undefined throws at line 23

### test verification

- `genBrainAtom.credentials.integration.test.ts` case1 (lines 27-56)
- line 36: getter increments counter
- line 52: `expect(getterCallCount).toBeGreaterThan(0)` — proves getter called
- line 53: `expect(result.output).not.toBeNull()` — proves api call succeeded

---

## critical path 3: getter called fresh per ask

### i trace the code execution

1. **first ask()** (genBrainAtom.ts:78)
   ```ts
   const creds = await getSdkXaiCreds({}, context);
   // getter invoked → count = 1
   ```

2. **second ask()** (genBrainAtom.ts:78)
   ```ts
   const creds = await getSdkXaiCreds({}, context);
   // getter invoked again → count = 2
   ```

### why it holds

- **no cache in getSdkXaiCreds**: implementation calls `supplier.creds()` directly
- **no cache in genBrainAtom**: `ask()` calls `getSdkXaiCreds` every time
- **user controls cache**: wrap getter with `with-simple-cache` if desired

### code evidence

getSdkXaiCreds.ts lines 18-24:
```ts
if (supplier?.creds) {
  const creds = await supplier.creds();  // called every time
  return { XAI_API_KEY: creds?.XAI_API_KEY ?? ... };
}
```

no memoization, no state, no cache.

### test verification

- `genBrainAtom.credentials.integration.test.ts` case2 (lines 58-99)
- line 96: `expect(countAfterFirst).toEqual(1)`
- line 97: `expect(countAfterSecond).toEqual(2)`

---

## critical path 4: multi-tenant credential isolation

### i trace the code execution

1. **contextA has getterA**
   ```ts
   contextA['brain.supplier.xai'].creds = async () => {
     apiKeysUsed.push('keyA');
     return { XAI_API_KEY: realApiKey };
   };
   ```

2. **contextB has getterB**
   ```ts
   contextB['brain.supplier.xai'].creds = async () => {
     apiKeysUsed.push('keyB');
     return { XAI_API_KEY: realApiKey };
   };
   ```

3. **ask with contextA** (genBrainAtom.ts:78)
   ```ts
   const creds = await getSdkXaiCreds({}, contextA);
   // getterA invoked → apiKeysUsed = ['keyA']
   ```

4. **ask with contextB** (genBrainAtom.ts:78)
   ```ts
   const creds = await getSdkXaiCreds({}, contextB);
   // getterB invoked → apiKeysUsed = ['keyA', 'keyB']
   ```

### why it holds

- **no shared state**: each context is independent object
- **no global cache**: `getSdkXaiCreds` reads from `context` parameter only
- **context is immutable**: `ask()` does not mutate context

### test verification

- `genBrainAtom.credentials.integration.test.ts` case4 (lines 131-180)
- line 177: `expect(apiKeysUsed).toEqual(['keyA', 'keyB'])`

---

## critical path 5: getter error propagation

### i trace the code execution

1. **getter throws**
   ```ts
   context['brain.supplier.xai'].creds = async () => {
     throw new Error('vault unreachable');
   };
   ```

2. **getSdkXaiCreds invokes getter** (getSdkXaiCreds.ts:19)
   ```ts
   const creds = await supplier.creds();
   // throws Error('vault unreachable')
   ```

3. **error propagates through ask()** (genBrainAtom.ts:78)
   ```ts
   const creds = await getSdkXaiCreds({}, context);
   // throws to caller
   ```

### why it holds

- **no try/catch**: getSdkXaiCreds has no error suppression
- **no wrap**: original error message preserved
- **fail-fast**: caller sees exactly what getter threw

### code evidence

getSdkXaiCreds.ts lines 18-24:
```ts
if (supplier?.creds) {
  const creds = await supplier.creds();  // throws if getter throws
  // ...no catch block
}
```

### test verification

- `genBrainAtom.credentials.integration.test.ts` case3 (lines 102-128)
- line 108: getter throws `new Error('vault unreachable')`
- line 126: `expect(error.message).toContain('vault unreachable')`

---

## critical path 6: clear error on absent credentials

### scenario A: getter returns undefined

**code path** (getSdkXaiCreds.ts:21-24):
```ts
return {
  XAI_API_KEY:
    creds?.XAI_API_KEY ??
    BadRequestError.throw('creds getter returned undefined XAI_API_KEY'),
};
```

**test**: getSdkXaiCreds.test.ts case3 (lines 44-58)
- line 55: `expect(error.message).toContain('creds getter returned undefined')`

### scenario B: no supplier and no env var

**code path** (getSdkXaiCreds.ts:29-32):
```ts
if (!apiKey) {
  throw new BadRequestError(
    'XAI_API_KEY required — provide via context or env',
  );
}
```

**test**: getSdkXaiCreds.test.ts case4 (lines 60-68)
- line 66: `expect(error.message).toContain('XAI_API_KEY required')`

### why it holds

both error messages:
- state the problem clearly
- suggest the solution (via context or env)
- use `BadRequestError` for user-actionable errors

---

## verdict

all critical paths traced through actual code execution:

| path | code file | lines | frictionless |
|------|-----------|-------|--------------|
| env var fallback | getSdkXaiCreds.ts | 27-34 | yes |
| context supplier | getSdkXaiCreds.ts | 15-24 | yes |
| fresh per ask | getSdkXaiCreds.ts | 18-24 | yes |
| multi-tenant | genBrainAtom.ts | 78 | yes |
| error propagation | getSdkXaiCreds.ts | 18-24 | yes |
| clear error: undefined | getSdkXaiCreds.ts | 21-24 | yes |
| clear error: absent | getSdkXaiCreds.ts | 29-32 | yes |

each path is:
- **minimal**: fewest steps to achieve goal
- **explicit**: no hidden behavior
- **fail-fast**: errors surface immediately with clear messages

the credential supplier feature is frictionless by design.

