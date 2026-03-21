# has-play-test-convention: self-review round 9

## i investigate journey test file conventions in this codebase

### step 1: search for .play.test.ts files

```sh
$ ls src/**/*.play.test.ts
(no results)

$ ls src/**/*.play.integration.test.ts
(no results)
```

**result**: zero `.play.test.ts` files exist in this repository.

---

### step 2: identify extant test file conventions

```sh
$ ls src/**/*.test.ts
src/contract/sdk/index.unit.test.ts
src/domain.operations/atom/genBrainAtom.truncation.integration.test.ts
src/domain.operations/atom/genBrainAtom.integration.test.ts
src/domain.operations/creds/getSdkXaiCreds.test.ts
src/domain.operations/atom/genBrainAtom.credentials.integration.test.ts
```

**conventions observed**:

| pattern | purpose | example |
|---------|---------|---------|
| `*.test.ts` | unit tests | `getSdkXaiCreds.test.ts` |
| `*.unit.test.ts` | unit tests (explicit) | `index.unit.test.ts` |
| `*.integration.test.ts` | integration tests | `genBrainAtom.integration.test.ts` |

---

### step 3: identify journey tests for credential supplier feature

the credential supplier feature added:
- `getSdkXaiCreds.test.ts` — unit tests for credential resolution
- `genBrainAtom.credentials.integration.test.ts` — integration tests for credential injection

these files test the feature's journeys:

| file | journey tested |
|------|----------------|
| `getSdkXaiCreds.test.ts` | credential resolution: supplier path, env fallback, error cases |
| `genBrainAtom.credentials.integration.test.ts` | end-to-end: supplier invocation, fresh-per-ask, multi-tenant, error propagation |

---

### step 4: compare against .play. convention requirement

the guide asks for `.play.test.ts` suffix for journey tests:
- `feature.play.test.ts`
- `feature.play.integration.test.ts`
- `feature.play.acceptance.test.ts`

**this repo does not use the `.play.` convention.**

---

## why this convention is not used

### 1. codebase convention predates this feature

extant test files follow `*.test.ts` and `*.integration.test.ts` patterns:
- `genBrainAtom.integration.test.ts` (extant before this feature)
- `genBrainAtom.truncation.integration.test.ts` (extant before this feature)

the credential supplier tests follow the established pattern:
- `getSdkXaiCreds.test.ts` — matches `*.test.ts`
- `genBrainAtom.credentials.integration.test.ts` — matches `*.integration.test.ts`

### 2. no .play. files in entire repo

```sh
$ git ls-files '*.play.test.ts' '*.play.integration.test.ts'
(no results)
```

zero `.play.` files exist. to introduce them for one feature would break consistency.

### 3. journey tests are identifiable by content

each test file uses BDD structure (`given`, `when`, `then`):

getSdkXaiCreds.test.ts:
```ts
given('[case1] context with supplier', () => {
  when('[t0] getSdkXaiCreds is called', () => {
    then('it returns creds from getter', async () => { ... });
  });
});
```

genBrainAtom.credentials.integration.test.ts:
```ts
given('[case1] context with creds getter', () => {
  when('[t0] ask is called with context supplier', () => {
    then('creds getter is called and used', async () => { ... });
  });
});
```

the BDD structure signals these are journey tests.

### 4. fallback convention is used

the guide states:
> "if not supported, is the fallback convention used?"

**fallback convention**: test files named by feature, via extant repo patterns.

| feature | unit tests | integration tests |
|---------|------------|-------------------|
| credential supplier | `getSdkXaiCreds.test.ts` | `genBrainAtom.credentials.integration.test.ts` |

the `credentials` in `genBrainAtom.credentials.integration.test.ts` identifies it as the credential supplier journey test.

---

## verdict

this check does not require changes:

1. **repo does not use .play. convention**: zero `.play.` files exist
2. **fallback convention is used**: `*.credentials.integration.test.ts` identifies credential journeys
3. **BDD structure signals intent**: `given/when/then` marks these as journey tests
4. **consistency preserved**: new tests follow extant patterns

the credential supplier journey tests are correctly located and named per this repo's conventions.

