# has-preserved-test-intentions: self-review round 4

## i compare every extant test line-by-line

### methodology

i fetched the original test files from main via `git show main:<path>` and compared them against the current versions with the `Read` tool. i examined every assertion in extant tests to verify they remain unchanged.

---

## file 1: index.unit.test.ts

### before (main)

```ts
import { genBrainAtom } from '../../domain.operations/atom/genBrainAtom';
```

### after (current)

```ts
import { genBrainAtom } from '@src/domain.operations/atom/genBrainAtom';
```

### line-by-line comparison of test logic

| line | main | current | match? |
|------|------|---------|--------|
| 11-14 | `expect(atoms).toHaveLength(8)` | `expect(atoms).toHaveLength(8)` | yes |
| 16-21 | `expect(atom).toBeInstanceOf(BrainAtom)` loop | identical | yes |
| 23-27 | `expect(slugs).toContain('xai/grok/code-fast-1')` | identical | yes |
| 35-36 | `expect(atom).toBeInstanceOf(BrainAtom)` | identical | yes |
| 39-40 | `expect(atom.slug).toEqual('xai/grok/code-fast-1')` | identical | yes |
| 43-44 | `expect(atom.repo).toEqual('xai')` | identical | yes |

**what did this test verify before?**
- case1: `getBrainAtomsByXAI` returns exactly 8 atoms, each is a BrainAtom, includes grok/code-fast-1
- case2: `genBrainAtom` returns BrainAtom with correct slug and repo

**does it still verify the same behavior?** yes.

**why it holds**: the only change is the import path alias. `@src/` resolves to the same module as `../../domain.operations/atom/`. all 6 assertions remain byte-for-byte identical.

---

## file 2: genBrainAtom.integration.test.ts

### import changes

```diff
-import { BadRequestError } from 'helpful-errors';
+import { BadRequestError, UnexpectedCodePathError } from 'helpful-errors';
-import { TEST_ASSETS_DIR } from '../../.test/assets/dir';
+import { TEST_ASSETS_DIR } from '@src/.test/assets/dir';
```

### line-by-line comparison of extant tests (cases 1-3)

i read lines 24-141 from both main and current branch. here is the evidence:

**case1 (atom creation):**

| assertion | main line | current line | identical? |
|-----------|-----------|--------------|------------|
| `expect(brainAtom.repo).toEqual('xai')` | 26-27 | 26-27 | yes |
| `expect(brainAtom.slug).toEqual('xai/grok/code-fast-1')` | 30-31 | 30-31 | yes |
| `expect(brainAtom.description).toBeDefined()` | 34-36 | 34-36 | yes |

**case2 (ask with prompt):**

| assertion | main line | current line | identical? |
|-----------|-----------|--------------|------------|
| `expect(result.output.content).toBeDefined()` | 52-55 | 52-55 | yes |
| `expect(result.metrics.size.tokens.input).toBeGreaterThan(0)` | 58-60 | 58-60 | yes |
| `expect(result.metrics.cost.cash.deets.input).toBeDefined()` | 63-66 | 63-66 | yes |
| `expect(result.metrics.cost.time).toBeDefined()` | 69-70 | 69-70 | yes |
| `expect(result.output.content).toContain('ZEBRA42')` | 86-87 | 86-87 | yes |

**case3 (episode continuation):**

| assertion | main line | current line | identical? |
|-----------|-----------|--------------|------------|
| `expect(resultFirst.episode).toBeDefined()` | 103-106 | 103-106 | yes |
| `expect(resultFirst.series).toBeNull()` | 109-110 | 109-110 | yes |
| `expect(resultSecond.output.content).toContain('PAPAYA99')` | 133-134 | 133-134 | yes |
| `expect(resultSecond.episode.exchanges).toHaveLength(2)` | 137-138 | 137-138 | yes |

**what did these tests verify before?**
- case1: atom has correct repo, slug, and defined description
- case2: ask returns response with metrics, briefs are honored (ZEBRA42)
- case3: episode continuation works, series is null for atoms

**do they still verify the same behavior?** yes.

**why it holds**: i compared the raw content from `git show main:...` against `Read` of current file. lines 24-141 are byte-for-byte identical except for import path change. no assertion was modified, weakened, or removed.

---

## new tests (cases 4-10)

cases 4-10 are pure additions that begin at line 143. they test tool invocation, a separate feature from credential supplier. these cannot violate preservation — they add new coverage for new functionality.

---

## forbidden actions audit

| forbidden action | did i do it? | evidence |
|------------------|--------------|----------|
| weaken assertions to make tests pass | no | all assertions identical |
| remove test cases that "no longer apply" | no | 0 cases removed |
| change expected values to match broken output | no | ZEBRA42, PAPAYA99, MANGO77 unchanged |
| delete tests that fail | no | 0 tests deleted |

---

## verdict

all test intentions preserved. the only changes to extant tests are:
1. import paths: relative → alias (`@src/`)
2. additional imports: `UnexpectedCodePathError` for new cases

no assertion logic was modified. the tests verify the exact same behaviors before and after.

