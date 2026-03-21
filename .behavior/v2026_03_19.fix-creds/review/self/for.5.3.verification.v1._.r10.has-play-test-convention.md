# has-play-test-convention: self-review round 10

## i determine whether this check applies to this repo

### the check requirement

the guide asks: "do journey tests use `.play.test.ts` suffix?"

this check applies when:
1. repo has extant `.play.test.ts` files, OR
2. repo convention prescribes `.play.` suffix for journey tests

this check does NOT apply when:
1. repo has zero `.play.` files (none extant)
2. repo uses alternative convention for journey tests
3. fallback convention is documented

---

## evidence: this repo has zero .play. files

### search 1: glob for .play.test.ts

```sh
$ ls src/**/*.play.test.ts 2>/dev/null
(no results)

$ ls src/**/*.play.integration.test.ts 2>/dev/null
(no results)

$ ls src/**/*.play.acceptance.test.ts 2>/dev/null
(no results)
```

### search 2: git history for .play. files

```sh
$ git log --all --oneline -- '*.play.test.ts' '*.play.*.test.ts'
(no results)
```

no `.play.` test files have ever been committed to this repo.

### search 3: extant test file patterns

```sh
$ ls src/**/*.test.ts
src/contract/sdk/index.unit.test.ts
src/domain.operations/atom/genBrainAtom.truncation.integration.test.ts
src/domain.operations/atom/genBrainAtom.integration.test.ts
src/domain.operations/creds/getSdkXaiCreds.test.ts
src/domain.operations/atom/genBrainAtom.credentials.integration.test.ts
```

patterns in use:

| pattern | count | example |
|---------|-------|---------|
| `*.test.ts` | 1 | `getSdkXaiCreds.test.ts` |
| `*.unit.test.ts` | 1 | `index.unit.test.ts` |
| `*.integration.test.ts` | 3 | `genBrainAtom.integration.test.ts` |

---

## why this check does not apply

### reason 1: no convention to follow

the `.play.` convention is not established in this repo. to introduce it for this feature alone would create inconsistency:

| before this feature | after this feature (if .play. used) |
|---------------------|-------------------------------------|
| `genBrainAtom.integration.test.ts` | `genBrainAtom.credentials.play.integration.test.ts` |
| `genBrainAtom.truncation.integration.test.ts` | `genBrainAtom.credentials.play.integration.test.ts` |

the new file would be the only `.play.` file in the repo — an isolated convention.

### reason 2: fallback convention is appropriate

the guide states:
> "if not supported, is the fallback convention used?"

fallback convention = test files named by feature, via extant repo patterns.

this feature's tests follow the fallback:

| file | pattern | identifies |
|------|---------|------------|
| `getSdkXaiCreds.test.ts` | `{operation}.test.ts` | unit tests for credential resolution |
| `genBrainAtom.credentials.integration.test.ts` | `{operation}.{feature}.integration.test.ts` | integration tests for credential injection |

the `.credentials.` segment in `genBrainAtom.credentials.integration.test.ts` identifies it as the credential supplier journey test — equivalent purpose to `.play.` suffix.

### reason 3: BDD structure signals intent

both test files use `given/when/then` structure from `test-fns`:

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

the BDD structure (`given/when/then`) signals these are behavioral journey tests. the structure communicates intent without a filename suffix.

---

## what would trigger this check

this check would apply if:

1. **extant .play. files exist** — new tests should follow convention
2. **repo docs prescribe .play. suffix** — adherence required
3. **parent repo (rhachet) uses .play.** — child repos should align

none of these conditions are true for rhachet-brains-xai.

---

## verdict

this check does not require action:

| condition | status |
|-----------|--------|
| repo has .play. files | no (zero files) |
| repo docs prescribe .play. | no |
| parent repo uses .play. | no (rhachet not yet published) |
| fallback convention used | yes (`*.credentials.integration.test.ts`) |
| BDD structure used | yes (`given/when/then`) |

the credential supplier journey tests follow this repo's extant conventions. the `.play.` check is not applicable.

