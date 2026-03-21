# has-journey-tests-from-repros: self-review round 4

## i search for the repros artifact

the guide references:
- `.behavior/v2026_03_19.fix-creds/3.2.distill.repros.experience.*.md`

i ran `ls -la .behavior/v2026_03_19.fix-creds/` and found no repros artifact.

**files that exist:**
- 0.wish.md
- 1.vision.md (+ .guard, .stone)
- 2.1.criteria.blackbox.md (+ .stone)
- 2.2.criteria.blackbox.matrix.md (+ .stone)
- 3.1.3.research.internal.product.code.prod._.v1.i1.md (+ .stone)
- 3.1.3.research.internal.product.code.test._.v1.i1.md (+ .stone)
- 3.3.1.blueprint.product.v1.i1.md (+ .guard, .stone)
- 4.1.roadmap.v1.i1.md (+ .stone)
- 5.1.execution.phase0_to_phaseN.v1.i1.md (+ .guard, .stone)
- 5.2.evaluation.v1.i1.md (+ .guard, .stone)
- 5.3.verification.v1.i1.md (+ .guard, .stone)

**files that do NOT exist:**
- 3.2.distill.repros.experience.*.md — no repros artifact

---

## why this check does not apply

the repros artifact captures reproduction journeys for defect fixes or bug investigation. this behavior (`v2026_03_19.fix-creds`) is a feature addition, not a defect fix.

the workflow followed was:
1. wish → vision → criteria → research → blueprint → roadmap → execution → evaluation → verification

no repros phase was included because:
- there was no defect to reproduce
- this is new functionality (credential supplier context)
- journey tests were sketched in vision (1.vision.md) and criteria (2.1.criteria.blackbox.md)

---

## journey test coverage via vision/criteria

the journey tests derive from:
- **vision usecases** (1.vision.md): 4 usecases defined (simple local dev, production secrets manager, multi-tenant, tests without env pollution)
- **criteria usecases** (2.1.criteria.blackbox.md): 8 usecases defined

these were implemented as tests:
- `genBrainAtom.credentials.integration.test.ts`: cases 1-4 cover credential supplier journeys
- `getSdkXaiCreds.test.ts`: cases 1-4 cover credential resolution paths

---

## verdict

this check does not apply — no repros artifact exists for this feature addition. the equivalent journey tests were derived from vision/criteria and are covered by the credential test files.

