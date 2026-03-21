# has-behavior-coverage: self-review round 1

## i verify every behavior from wish/vision has a test

### wish behaviors (0.wish.md)

| wish behavior | test coverage | why it holds |
|---------------|---------------|--------------|
| support context with ContextBrainSupplier | genBrainAtom.credentials.integration.test.ts case 1 | test passes context supplier, verifies getter called |
| creds from supplier context as first option | getSdkXaiCreds.test.ts case 1 | test verifies supplier takes precedence |
| fallback to env-var if not supplied | getSdkXaiCreds.test.ts case 2 | test verifies env fallback |
| getter pattern `() => Promise<{ XAI_API_KEY }>` | genBrainAtom.credentials.integration.test.ts case 1 | test uses async getter, verifies it works |

### vision behaviors (1.vision.md)

| vision usecase | test coverage | why it holds |
|----------------|---------------|--------------|
| simple local development (env fallback) | genBrainAtom.integration.test.ts | uses env var path |
| production with secrets manager | genBrainAtom.credentials.integration.test.ts case 1 | context supplier with getter |
| getter called fresh per ask | genBrainAtom.credentials.integration.test.ts case 2 | verifies call count per ask |
| multi-tenant isolation | genBrainAtom.credentials.integration.test.ts case 4 | different contexts per call |
| tests without env pollution | genBrainAtom.credentials.integration.test.ts case 1 | injects test credentials |
| getter error propagation | genBrainAtom.credentials.integration.test.ts case 3 | verifies error bubbles up |
| precedence: creds > env | getSdkXaiCreds.test.ts case 1 + 2 | supplier checked before env |

### criteria behaviors (2.1.criteria.blackbox.md)

| criteria usecase | test file | why it holds |
|------------------|-----------|--------------|
| usecase.1: env var fallback | genBrainAtom.integration.test.ts | tests default path |
| usecase.2: context supplier | genBrainAtom.credentials.integration.test.ts case 1 | tests supplier path |
| usecase.3: getter fresh per ask | genBrainAtom.credentials.integration.test.ts case 2 | counts getter calls |
| usecase.4: multi-tenant isolation | genBrainAtom.credentials.integration.test.ts case 4 | different contexts verified |
| usecase.5: tests without env pollution | genBrainAtom.credentials.integration.test.ts case 1 | no env dependency |
| usecase.6: getter error propagation | genBrainAtom.credentials.integration.test.ts case 3 | error message verified |
| usecase.7: precedence order | getSdkXaiCreds.test.ts | supplier before env |
| usecase.8: type safety via factory | compile-time via tsc | types checked at build |

---

## verdict

all behaviors have test coverage:
- 4 wish behaviors covered
- 7 vision usecases covered
- 8 criteria usecases covered

no behavior left without a test.
