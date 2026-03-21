# has-contract-output-variants-snapped: self-review round 5

## i examine the public contracts for snapshot applicability

### what are the public contracts?

i read `src/contract/sdk/index.ts` (lines 1-27) to identify exports:

1. `getBrainAtomsByXAI(): BrainAtom[]` — returns array of BrainAtom objects
2. `genBrainAtom({ slug })` — factory that creates BrainAtom
3. `BrainSuppliesXai` — type export (not runtime)

### what did the credential supplier feature add?

- `BrainSuppliesXai` type — new type export for consumers
- `context` parameter on `ask()` — internal change to genBrainAtom behavior
- `getSdkXaiCreds` — internal domain operation (not exported publicly)

---

## snapshot applicability analysis

### is this a CLI?

no. this is an SDK library (`rhachet-brains-xai`). there is no CLI with stdout/stderr to capture.

### is this an API?

no. this is a TypeScript library that consumers import, not an HTTP API with response bodies.

### is this a UI?

no. this is a backend library with no visual output.

### what output does this SDK produce?

the SDK produces `BrainAtom` objects, which are defined by the upstream `rhachet` package. the response shape of `atom.ask()` is:

```ts
{
  output: { content: string } | null,
  calls: { tools: [...] } | null,
  episode: { ... },
  metrics: { ... },
  series: null
}
```

this shape is controlled by `rhachet`, not this package. to snapshot it would duplicate upstream test responsibility.

---

## why snapshots are not applicable here

| output type | applicable? | reason |
|-------------|-------------|--------|
| CLI stdout/stderr | no | not a CLI |
| API responses | no | not an HTTP API |
| UI screens | no | not a UI |
| SDK responses | no | response shape is from upstream `rhachet` |
| error messages | partial | error messages are tested via assertion |

### error message coverage

error messages are tested via assertions, not snapshots:
- `getSdkXaiCreds.test.ts` line 55: `expect(error.message).toContain('creds getter returned undefined')`
- `getSdkXaiCreds.test.ts` line 66: `expect(error.message).toContain('XAI_API_KEY required')`
- `genBrainAtom.credentials.integration.test.ts` line 126: `expect(error.message).toContain('vault unreachable')`

these assertions verify error message content without snapshot overhead.

---

## extant snapshot usage in codebase

i ran `grep -r "toMatchSnapshot" src/` and found: **no snapshots**.

this codebase does not use snapshot tests. the test strategy relies on explicit assertions.

---

## verdict

snapshot tests are not applicable for this feature:
- this is an SDK library, not a CLI, API, or UI
- response shapes are defined by upstream `rhachet`
- error messages are verified via assertions
- the codebase does not use snapshot tests

the credential supplier feature does not introduce public output variants that warrant snapshot coverage.

