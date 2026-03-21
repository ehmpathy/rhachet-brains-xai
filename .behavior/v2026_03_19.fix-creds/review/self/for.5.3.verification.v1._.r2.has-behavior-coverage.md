# has-behavior-coverage: self-review round 2

## i read the test code and verify each behavior

### wish behavior: "support context with ContextBrainSupplier"

**test**: genBrainAtom.credentials.integration.test.ts case 1 (lines 27-56)

**how test proves behavior**:
- line 33-40: creates context with `'brain.supplier.xai'` key and `creds` getter
- line 43-50: passes context to `atom.ask()`
- line 52: asserts `getterCallCount > 0` — proves context supplier was invoked
- line 53: asserts `result.output !== null` — proves ask succeeded with supplier

**why it holds**: the test passes a context supplier and verifies both that the getter was called AND that the api call succeeded with the supplied credentials.

---

### wish behavior: "creds from supplier context as first option"

**test**: getSdkXaiCreds.test.ts case 1

**how test proves behavior**:
- provides supplier in context
- verifies supplier's getter is called
- returns credentials from getter, not env

**why it holds**: test explicitly verifies supplier path is taken when supplier is present. separate test (case 2) verifies env fallback only when no supplier.

---

### wish behavior: "fallback to env-var if not supplied"

**test**: getSdkXaiCreds.test.ts case 2

**how test proves behavior**:
- no supplier in context
- process.env.XAI_API_KEY is set
- returns env var value

**test**: genBrainAtom.integration.test.ts (all tests)

**why it holds**: the entire prior test suite uses env var path without context supplier. all those tests pass, which proves env fallback works.

---

### wish behavior: "getter pattern `() => Promise<{ XAI_API_KEY }>`"

**test**: genBrainAtom.credentials.integration.test.ts case 1 (lines 35-38)

**actual getter used**:
```ts
creds: async () => {
  getterCallCount += 1;
  return { XAI_API_KEY: realApiKey };
},
```

**why it holds**: getter is async function that returns `{ XAI_API_KEY: string }` — exact shape from wish.

---

### vision usecase: "getter called fresh per ask"

**test**: genBrainAtom.credentials.integration.test.ts case 2 (lines 58-100)

**how test proves behavior**:
- line 61: initializes `getterCallCount = 0`
- lines 74-82: first ask, stores count in `countAfterFirst`
- lines 85-93: second ask, stores count in `countAfterSecond`
- lines 96-97: asserts `countAfterFirst === 1`, `countAfterSecond === 2`

**why it holds**: each ask() call increments the counter. if getter were cached, second ask would not increment. test proves getter is called fresh per ask.

---

### vision usecase: "multi-tenant isolation"

**test**: genBrainAtom.credentials.integration.test.ts case 4 (lines 131-180)

**how test proves behavior**:
- lines 137-144: contextA with getter that logs 'keyA'
- lines 146-153: contextB with getter that logs 'keyB'
- lines 157-165: ask with contextA
- lines 167-175: ask with contextB
- line 177: asserts `apiKeysUsed === ['keyA', 'keyB']`

**why it holds**: the array tracks which getter was called per ask. if isolation failed, we'd see the same key twice or wrong order. test proves each ask uses its own context.

---

### vision usecase: "getter error propagation"

**test**: genBrainAtom.credentials.integration.test.ts case 3 (lines 102-129)

**how test proves behavior**:
- lines 105-111: getter throws `new Error('vault unreachable')`
- lines 114-123: wraps ask in `getError()`
- lines 125-126: asserts error exists and message contains 'vault unreachable'

**why it holds**: test proves error from getter bubbles up to caller with original message intact.

---

### vision usecase: "type safety via factory"

**test**: compile-time via `npm run test:types`

**why it holds**: tsc checks types at build. if `BrainSuppliesXai` shape were wrong, compilation would fail. test:types passes, which proves type safety.

---

## verdict

all behaviors are covered by tests:

| behavior | test location | proof |
|----------|---------------|-------|
| context supplier | case 1 lines 27-56 | getterCallCount > 0 |
| supplier precedence | getSdkXaiCreds case 1 | supplier path taken |
| env fallback | getSdkXaiCreds case 2 | env var used |
| getter pattern | case 1 lines 35-38 | async fn returns { XAI_API_KEY } |
| getter fresh per ask | case 2 lines 96-97 | count increments per ask |
| multi-tenant isolation | case 4 line 177 | ['keyA', 'keyB'] in order |
| error propagation | case 3 lines 125-126 | message preserved |
| type safety | npm run test:types | compilation passes |

no behavior lacks test coverage.
