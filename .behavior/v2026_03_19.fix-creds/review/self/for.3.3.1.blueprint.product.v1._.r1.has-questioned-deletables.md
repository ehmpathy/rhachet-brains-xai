# self-review r1: has-questioned-deletables

## components questioned

### component 1: getApiKey helper function

| question | answer |
|----------|--------|
| can this be removed entirely? | yes |
| if we deleted and had to add back, would we? | no |
| did we optimize a part that shouldn't exist? | yes |
| simplest version that works? | inline into openai client creation |

**decision**: DELETE. the original design had a getApiKey helper that only returned the apiKey string. but with the corrected precedence logic (creds getter > context.openai > env var), we need to create the entire OpenAI client in each branch. a helper that only returns apiKey doesn't fit this structure.

**how fixed**: removed getApiKey from the blueprint. the credential precedence logic is now inlined into the openai client creation block, which is clearer and avoids the awkward helper.

---

### component 2: separate test file

| question | answer |
|----------|--------|
| can this be removed entirely? | yes, could add to extant file |
| if we deleted and had to add back, would we? | probably yes |
| did we optimize a part that shouldn't exist? | no |
| simplest version that works? | separate file is simpler for isolation |

**why it holds**: separation keeps concerns clear. extant tests verify env var path without modification. new tests verify credential supplier path. to mix them would complicate test setup (some need env var, some explicitly avoid it).

---

### component 3: test case 4 (env var fallback)

| question | answer |
|----------|--------|
| can this be removed entirely? | maybe |
| if we deleted and had to add back, would we? | uncertain |
| did we optimize a part that shouldn't exist? | possibly |
| simplest version that works? | extant tests already cover env var |

**decision**: DELETE this test case. extant `genBrainAtom.integration.test.ts` already tests env var fallback. to add another test is redundant.

---

### component 4: test case 5 (multi-tenant isolation)

| question | answer |
|----------|--------|
| can this be removed entirely? | maybe |
| if we deleted and had to add back, would we? | yes for confidence |
| did we optimize a part that shouldn't exist? | no |
| simplest version that works? | could be covered by case 1 with variation |

**why it holds**: multi-tenant is a key usecase from vision. explicit test proves isolation works. worth the cost for confidence. keep.

---

## issues found and how they were fixed

### issue 1: unnecessary getApiKey helper

**before**: blueprint proposed a `getApiKey()` helper function that only returned the apiKey string.

**problem**: with the corrected precedence logic (creds getter > context.openai > env var), we need to create the OpenAI client differently in each branch. a helper that only returns apiKey doesn't fit — we'd still need branching logic after calling it.

**how fixed**: deleted the getApiKey helper from the blueprint. the credential precedence logic is now inlined into the openai client creation block. each branch creates its own client with the appropriate apiKey source.

**verification**: the codepath tree and implementation detail sections now show inline logic instead of a helper.

---

### issue 2: precedence logic defect in implementation detail

**before**: the implementation at lines 139-145 shows:

```ts
const apiKey = await getApiKey(context);
const openai = (context?.openai as OpenAI | undefined) ?? new OpenAI({ apiKey, ... });
```

**problem**: this allows context.openai to be used even when creds getter is present. but criteria says "creds getter takes precedence over openai client". if user provides creds getter, we must create new client with those creds — ignore any context.openai.

**how fixed**: updated implementation to check creds getter BEFORE we check context.openai:

```ts
// if creds getter present, always create fresh client
const supplier = context?.['brain.supplier.xai'];
if (supplier?.creds) {
  const creds = await supplier.creds();
  openai = new OpenAI({ apiKey: creds.XAI_API_KEY, baseURL: 'https://api.x.ai/v1' });
} else {
  // fallback: context.openai > env var
  openai = (context?.openai as OpenAI | undefined) ??
    new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: 'https://api.x.ai/v1' });
}
```

**verification**: updated blueprint to reflect correct precedence.

---

### issue 3: redundant test case

**before**: test case 4 (env var fallback) duplicates coverage from extant tests.

**problem**: extant `genBrainAtom.integration.test.ts` already verifies env var path works. to add another test wastes effort.

**how fixed**: removed test case 4 from blueprint. now 4 test cases instead of 5.

**verification**: extant tests provide coverage.

---

## non-issues confirmed

### all other components are minimal

- BrainSuppliesXai type: required, cannot simplify
- re-export in sdk/index.ts: required for consumers
- README docs: 4 usecases map to criteria, all required
- left 4 test cases: each verifies distinct behavior

**why this holds**: each component maps directly to a requirement from vision or criteria. no component exists without purpose.

