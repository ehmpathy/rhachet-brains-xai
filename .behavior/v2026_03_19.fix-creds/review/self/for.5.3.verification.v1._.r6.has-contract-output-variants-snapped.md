# has-contract-output-variants-snapped: self-review round 6

## i examine sdk response structure and snapshot applicability

### public sdk method: `atom.ask()`

the primary public contract is `atom.ask()`, which returns:

```ts
{
  output: { content: string } | null,
  calls: { tools: ToolInvocation[] } | null,
  episode: { hash: string, exchanges: Exchange[] },
  metrics: {
    size: { tokens: { input, output } },
    cost: { cash: { deets, total }, time }
  },
  series: null
}
```

### response structure assertions in extant tests

i read `genBrainAtom.integration.test.ts` lines 41-80 to verify response structure coverage:

| field | assertion | test line |
|-------|-----------|-----------|
| `output.content` | `expect(result.output.content).toBeDefined()` | line 53 |
| `output.content` length | `expect(result.output.content.length).toBeGreaterThan(0)` | line 54 |
| `output.content` value | `expect(result.output.content.toLowerCase()).toContain('hello')` | line 55 |
| `metrics.size.tokens.input` | `expect(...).toBeGreaterThan(0)` | line 59 |
| `metrics.size.tokens.output` | `expect(...).toBeGreaterThan(0)` | line 60 |
| `metrics.cost.cash.deets.input` | `expect(...).toBeDefined()` | line 64 |
| `metrics.cost.cash.deets.output` | `expect(...).toBeDefined()` | line 65 |
| `metrics.cost.cash.total` | `expect(...).toBeDefined()` | line 66 |
| `metrics.cost.time` | `expect(...).toBeDefined()` | line 70 |
| `episode` | `expect(resultFirst.episode).toBeDefined()` | line 103-106 |
| `series` | `expect(resultFirst.series).toBeNull()` | line 109-110 |

---

### why snapshots are not appropriate for this SDK

**1. response content is non-deterministic**

the `output.content` field contains LLM-generated text, which varies per call:
- same prompt may yield different responses
- timestamps, metrics, etc. change per invocation
- snapshots would fail on every run due to drift

**2. response shape is validated by upstream**

the response structure is defined by `rhachet.BrainAtom`. type safety is enforced at compile time. to snapshot the shape would duplicate upstream responsibility.

**3. assertions test what matters**

the extant tests verify:
- response structure fields exist (`.toBeDefined()`)
- response content meets criteria (`.toContain('hello')`, `.toContain('ZEBRA42')`)
- metrics are populated (`.toBeGreaterThan(0)`)

these assertions are stable and meaningful. snapshots would be brittle.

---

### credential supplier feature: new outputs?

the credential supplier feature does not introduce new response fields:
- `atom.ask()` response structure is unchanged
- `getSdkXaiCreds` is internal (not exported)
- `BrainSuppliesXai` is a type, not a runtime output

the feature changes *how* credentials are obtained, not *what* is returned.

---

### error output coverage

i verified error message assertions:

| error case | assertion | test location |
|------------|-----------|---------------|
| creds getter returns undefined | `expect(error.message).toContain('creds getter returned undefined')` | getSdkXaiCreds.test.ts line 55 |
| no supplier, no env var | `expect(error.message).toContain('XAI_API_KEY required')` | getSdkXaiCreds.test.ts line 66 |
| getter throws | `expect(error.message).toContain('vault unreachable')` | credentials.integration.test.ts line 126 |

error messages are verified via partial match assertions — more stable than full snapshots.

---

### verdict

snapshot tests are not applicable for this SDK library because:

1. **non-deterministic content**: LLM outputs vary per call
2. **shape validated upstream**: response structure is from `rhachet`
3. **assertions are sufficient**: extant tests verify structure and semantics
4. **no new outputs**: credential supplier changes input path, not response shape
5. **codebase convention**: no extant snapshots in this repo

the credential supplier feature does not warrant snapshot tests.

