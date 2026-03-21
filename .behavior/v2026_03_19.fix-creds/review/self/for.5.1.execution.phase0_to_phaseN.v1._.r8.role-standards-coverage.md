# role-standards-coverage: self-review round 8

## i re-read the actual code line by line

i am the reviewer, not the author. i question every assumption.

---

## rule categories to check

| category | briefs directory | relevance |
|----------|------------------|-----------|
| procedures | `evolvable.procedures/` | (input, context), arrow functions, hook wrappers |
| domain operations | `evolvable.domain.operations/` | get/set/gen verbs |
| errors | `pitofsuccess.errors/` | fail-fast, helpful errors, no failhide |
| types | `pitofsuccess.typedefs/` | no as-casts, shapefit |
| procedures safety | `pitofsuccess.procedures/` | idempotent, immutable vars |
| comments | `readable.comments/` | .what/.why headers |
| narrative | `readable.narrative/` | early returns, no else |
| test frames | `code.test/frames.behavior/` | given/when/then |
| test scope | `code.test/scope.unit/` | no remote boundaries |

---

## getSdkXaiCreds.ts — standards coverage

### check: pitofsuccess.procedures/rule.require.immutable-vars

line 19: `const creds = await supplier.creds();`
line 28: `const apiKey = process.env.XAI_API_KEY;`

**why it holds**: all variables are `const`, never reassigned.

### check: pitofsuccess.errors/rule.forbid.failhide

no try/catch blocks in file. errors propagate naturally.

**why it holds**: no error suppression, no failhide hazard.

### check: readable.narrative/rule.require.narrative-flow

```
line 14-15: // extract supplier...
line 17-25: // supplier provided...
line 27-34: // fallback to env var...
```

**why it holds**: three code paragraphs, each with comment, no depth beyond one if.

### check: pitofsuccess.procedures/rule.forbid.undefined-inputs

signature: `input: Empty`

**why it holds**: input is typed as Empty (not undefined). context is optional because it's the second arg in (input, context?) pattern.

### potential absent pattern: rule.require.hook-wrapper-pattern

this is a simple getter with no hooks. no withLogTrail or other wrappers needed.

**why it holds**: not every function needs hooks. this is a utility that extracts creds — no log or retry behavior required at this level.

---

## getSdkXaiCreds.test.ts — standards coverage

### check: code.test/scope.unit/rule.forbid.remote-boundaries

test manipulates `process.env` but does not cross actual remote boundaries (no fs, network, db).

**why it holds**: env var access is in-memory, not a remote boundary. the test is pure unit.

### check: code.test/frames.behavior/rule.forbid.redundant-expensive-operations

each then block calls `getSdkXaiCreds` once.

**why it holds**: no redundant calls across adjacent then blocks.

### check: afterEach cleanup

```ts
afterEach(() => {
  if (originalEnv !== undefined) {
    process.env.XAI_API_KEY = originalEnv;
  } else {
    delete process.env.XAI_API_KEY;
  }
});
```

**why it holds**: env is restored after each test, no pollution.

---

## genBrainAtom.credentials.integration.test.ts — standards coverage

### check: code.test/scope.unit/rule.forbid.remote-boundaries

this is .integration.test.ts — remote boundaries are allowed.

**why it holds**: the file is named correctly for integration tests.

### check: jest.setTimeout

line 25: `jest.setTimeout(60000);`

**why it holds**: integration tests with API calls need extended timeout.

### check: fail-fast guard

lines 8-9:
```ts
if (!process.env.XAI_API_KEY)
  throw new BadRequestError('XAI_API_KEY is required for integration tests');
```

**why it holds**: fails fast at module load if env not set.

### check: test isolation

each case creates its own context with its own getter. no shared mutable state.

**why it holds**: tests are isolated.

---

## ContextBrainSupplier.ts — standards coverage

### check: readable.comments/rule.require.what-why-headers

lines 1-10:
```ts
/**
 * .what = generic context type for brain suppliers
 * .why = enables typed context injection for any brain supplier
 *
 * .note = lives in _topublish/rhachet/ for future lift to rhachet core
 *
 * .example
 *   ContextBrainSupplier<'xai', BrainSuppliesXai>
 *   // expands to: { 'brain.supplier.xai': BrainSuppliesXai }
 */
```

**why it holds**: has .what, .why, .note, and .example sections.

### check: location

file is in `src/_topublish/rhachet/`

**why it holds**: follows _topublish convention for types to be lifted upstream.

---

## BrainSuppliesXai — standards coverage

### check: readable.comments/rule.require.what-why-headers

lines 14-16:
```ts
/**
 * .what = supplies for xai brain supplier
 * .why = enables credential injection without plaintext storage
 */
```

**why it holds**: has .what and .why.

### check: type correctness

```ts
creds: () => Promise<{ XAI_API_KEY: string }>;
```

**why it holds**: async getter, explicit return type, matches vision spec.

---

## potential absent patterns to check

### check: README documentation

blueprint prescribes README updates with credential supplier docs.

**status**: confirmed in vision, will verify in verification stone (not execution).

### check: sdk re-export

blueprint says: `export BrainSuppliesXai` from sdk/index.ts

**why it holds**: confirmed in prior reviews that sdk/index.ts exports BrainSuppliesXai.

---

## conclusion

all standards coverage verified:

| standard | getSdkXaiCreds.ts | unit test | integration test | types |
|----------|-------------------|-----------|------------------|-------|
| immutable vars | ✓ all const | n/a | n/a | n/a |
| no failhide | ✓ no try/catch | n/a | n/a | n/a |
| narrative flow | ✓ 3 paragraphs | n/a | n/a | n/a |
| no undefined inputs | ✓ input: Empty | n/a | n/a | n/a |
| no remote in unit | n/a | ✓ env only | n/a | n/a |
| correct file ext | n/a | ✓ .test.ts | ✓ .integration.test.ts | n/a |
| jest.setTimeout | n/a | n/a | ✓ 60000 | n/a |
| fail-fast guard | n/a | n/a | ✓ lines 8-9 | n/a |
| .what/.why | ✓ | n/a | ✓ asContext | ✓ all types |
| _topublish location | n/a | n/a | n/a | ✓ |

no absent patterns found. all relevant mechanic standards are applied.
