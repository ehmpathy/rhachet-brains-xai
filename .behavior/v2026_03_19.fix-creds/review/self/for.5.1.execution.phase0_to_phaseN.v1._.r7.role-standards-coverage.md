# role-standards-coverage: self-review round 7

## i enumerate the rule directories to check

| directory | relevance |
|-----------|-----------|
| `code.prod/evolvable.procedures/` | (input, context), arrow functions, dependency injection |
| `code.prod/evolvable.domain.operations/` | get/set/gen verbs, sync filename |
| `code.prod/pitofsuccess.errors/` | fail-fast, helpful errors |
| `code.prod/pitofsuccess.typedefs/` | type safety, shapefit |
| `code.prod/pitofsuccess.procedures/` | idempotent, no undefined inputs |
| `code.prod/readable.comments/` | .what/.why headers |
| `code.prod/readable.narrative/` | early returns, no else, narrative flow |
| `code.test/frames.behavior/` | given/when/then, useBeforeAll |
| `code.test/scope.unit/` | no remote boundaries |
| `code.test/scope.acceptance/` | black box |

---

## coverage check: what should be present?

### getSdkXaiCreds.ts

| standard | should be present? | is present? | why |
|----------|-------------------|-------------|-----|
| (input, context) | ✓ required | ✓ lines 10-12 | domain operation |
| arrow function | ✓ required | ✓ line 10 | all functions |
| `get` verb | ✓ required | ✓ getSdkXaiCreds | retrieval operation |
| filename = function | ✓ required | ✓ getSdkXaiCreds.ts exports getSdkXaiCreds | sync pattern |
| .what/.why header | ✓ required | ✓ lines 6-9 | exported function |
| fail-fast | ✓ required | ✓ lines 22-23, 30-32 | invalid states throw |
| BadRequestError | ✓ required | ✓ used | helpful-errors |
| early returns | ✓ required | ✓ line 25 | no else branches |
| type annotations | ✓ required | ✓ all types explicit | no inference |
| idempotent | n/a | n/a | retrieval, no mutation |
| validation | optional | not needed | inputs typed, context optional |

**gaps found**: none

### getSdkXaiCreds.test.ts

| standard | should be present? | is present? | why |
|----------|-------------------|-------------|-----|
| given/when/then | ✓ required | ✓ all cases | test structure |
| [caseN] labels | ✓ required | ✓ case1-4 | test labels |
| [tN] labels | ✓ required | ✓ t0 each | when labels |
| no mocks | ✓ required | ✓ no jest.mock | unit test standards |
| useBeforeAll | optional | not needed | no shared setup |
| getError for throws | ✓ required | ✓ cases 3-4 | error assertions |
| afterEach cleanup | ✓ required | ✓ env restoration | clean state |

**gaps found**: none

### genBrainAtom.credentials.integration.test.ts

| standard | should be present? | is present? | why |
|----------|-------------------|-------------|-----|
| given/when/then | ✓ required | ✓ all cases | test structure |
| [caseN] labels | ✓ required | ✓ case1-4 | test labels |
| [tN] labels | ✓ required | ✓ t0 each | when labels |
| no mocks | ✓ required | ✓ real API calls | integration test |
| real network calls | ✓ required | ✓ API calls | integration test |
| jest.setTimeout | ✓ required | ✓ 60000 | long tests |
| fail-fast guard | ✓ required | ✓ line 8-9 | require env |
| getError for throws | ✓ required | ✓ case 3 | error assertions |
| .what/.why on helper | ✓ required | ✓ lines 14-18 | asContext has header |
| documented exception | ✓ required | ✓ .note field | as-cast is documented |

**gaps found**: none

### ContextBrainSupplier.ts

| standard | should be present? | is present? | why |
|----------|-------------------|-------------|-----|
| .what/.why/.note | ✓ required | ✓ lines 1-6 | type export |
| type safety | ✓ required | ✓ generics typed | template literal |

**gaps found**: none

### BrainSuppliesXai in BrainAtom.config.ts

| standard | should be present? | is present? | why |
|----------|-------------------|-------------|-----|
| .what/.why header | ✓ required | ✓ lines 14-16 | type export |
| Promise type | ✓ required | ✓ async getter | explicit return |

**gaps found**: none

---

## patterns that could be absent but should be present

### error messages

| file | error | message quality |
|------|-------|-----------------|
| getSdkXaiCreds.ts:23 | getter undefined | "creds getter returned undefined XAI_API_KEY" — clear |
| getSdkXaiCreds.ts:31 | env absent | "XAI_API_KEY required — provide via context or env" — actionable |

**why it holds**: both error messages tell the user exactly what's wrong and how to fix it.

### test coverage completeness

| scenario | test file | covered? |
|----------|-----------|----------|
| supplier path | getSdkXaiCreds.test.ts case1 | ✓ |
| env fallback | getSdkXaiCreds.test.ts case2 | ✓ |
| undefined throws | getSdkXaiCreds.test.ts case3 | ✓ |
| absent throws | getSdkXaiCreds.test.ts case4 | ✓ |
| context getter used | integration case1 | ✓ |
| getter fresh per ask | integration case2 | ✓ |
| getter error propagates | integration case3 | ✓ |
| multi-tenant isolation | integration case4 | ✓ |

**why it holds**: all 4 unit cases + 4 integration cases cover the full behavior space.

### type exports

| type | exported from | re-exported from sdk |
|------|---------------|---------------------|
| BrainSuppliesXai | BrainAtom.config.ts | ✓ sdk/index.ts |
| ContextBrainSupplier | _topublish/rhachet/ | ✗ (intentional) |

**why ContextBrainSupplier not re-exported**: vision says "will be lifted to rhachet" — consumers should import from rhachet when available, not from this package.

---

## conclusion

all required standards are present:

| file | standards | coverage |
|------|-----------|----------|
| getSdkXaiCreds.ts | 11/11 | complete |
| getSdkXaiCreds.test.ts | 7/7 | complete |
| integration.test.ts | 10/10 | complete |
| ContextBrainSupplier.ts | 2/2 | complete |
| BrainSuppliesXai | 2/2 | complete |

no absent patterns found. all error messages are actionable. test coverage is complete.
