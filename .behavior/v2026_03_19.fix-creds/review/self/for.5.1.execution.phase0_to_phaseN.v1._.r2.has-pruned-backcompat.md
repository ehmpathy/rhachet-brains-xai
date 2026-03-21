# has-pruned-backcompat: self-review round 2

## deeper reflection

i re-read the code with fresh eyes. let me trace each backwards-compat decision:

---

### 1. env var fallback — why it holds

**the code**:
```ts
// getSdkXaiCreds.ts
if (supplier?.creds) {
  // supplier path
} else {
  // fallback to env var
  const apiKey = process.env.XAI_API_KEY;
}
```

**why this is correct**:

the vision explicitly states under "evaluation > pros":
> "zero break changes: env var fallback preserves backwards compat"

and in "usecase 1: simple local development":
> "goal: quick iteration without ceremony"
> ```ts
> // just works — falls back to process.env.XAI_API_KEY
> const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
> await atom.ask({ ... });
> ```

the wisher wanted:
1. new capability (context supplier)
2. without break extant code (env var path)

this is not assumed "to be safe" — it was prescribed.

---

### 2. optional context parameter — why it holds

**the code**:
```ts
// genBrainAtom.ts line 67
context?: { 'brain.supplier.xai'?: BrainSuppliesXai },
```

**why this is correct**:

the `?` makes context optional. this enables:
- extant code: `atom.ask({ ... })` continues to work
- new code: `atom.ask({ ... }, context)` uses supplier

the vision usecase 1 demonstrates:
```ts
// just works — falls back to process.env.XAI_API_KEY
const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });
await atom.ask({ role: {}, prompt: 'hello', schema: { output: z.object({}) } });
```

no context passed = must work. the optional parameter enables this.

---

### 3. what i could have done wrong but did not

**potential mistake**: mandatory context parameter

if i had written:
```ts
context: { 'brain.supplier.xai': BrainSuppliesXai },  // required!
```

this would break all extant code. the wisher explicitly did not want this.

**potential mistake**: no env var fallback

if i had written:
```ts
if (!supplier?.creds) {
  throw new BadRequestError('context supplier required');
}
```

this would break extant code that relies on env vars. the wisher explicitly did not want this.

---

## conclusion

both backwards-compat behaviors were explicitly requested in the vision:
1. env var fallback — vision evaluation + usecase 1
2. optional context — vision usecase 1

no assumed compatibility found. the implementation follows the prescription exactly.
