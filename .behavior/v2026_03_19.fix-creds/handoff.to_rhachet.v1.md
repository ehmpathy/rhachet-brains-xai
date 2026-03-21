# handoff: context supplier types for rhachet

## from

rhachet-brains-xai — credential supplier feature

## to

rhachet core

---

## what we need

### 1. generic context on BrainAtom.ask()

current signature in rhachet:

```ts
ask: <TOutput, TPlugs>(
  input: { ... },
  context?: Empty,
) => Promise<BrainOutput<...>>
```

needed signature:

```ts
ask: <TOutput, TPlugs, TContext = Empty>(
  input: { ... },
  context?: TContext,
) => Promise<BrainOutput<...>>
```

**why**: brain implementations need to accept supplier-specific context (e.g., `ContextBrainSupplier<'xai', BrainSuppliesXai>`) without type errors.

---

### 2. publish ContextBrainSupplier type

```ts
/**
 * .what = generic context type for brain suppliers
 * .why = enables typed context injection for any brain supplier
 *
 * .example
 *   ContextBrainSupplier<'xai', BrainSuppliesXai>
 *   // expands to: { 'brain.supplier.xai': BrainSuppliesXai }
 */
export type ContextBrainSupplier<TSlug extends string, TSupplies> = {
  [K in `brain.supplier.${TSlug}`]: TSupplies;
};
```

export from `rhachet` or `rhachet/brains`.

---

### 3. publish genContextBrainSupplier factory

```ts
/**
 * .what = factory to create typed brain supplier contexts
 * .why = provides pit-of-success for context construction
 *
 * .example
 *   const context = genContextBrainSupplier<'xai', BrainSuppliesXai>({
 *     creds: async () => ({ XAI_API_KEY: await vault.get('XAI_API_KEY') }),
 *   });
 */
export const genContextBrainSupplier = <TSlug extends string, TSupplies>(
  supplies: TSupplies,
): ContextBrainSupplier<TSlug, TSupplies> => {
  // implementation returns { [`brain.supplier.${slug}`]: supplies }
  // note: slug must be inferred or passed explicitly
};
```

**design question**: how to infer/pass slug? options:

| approach | usage | tradeoff |
|----------|-------|----------|
| explicit slug arg | `genContextBrainSupplier('xai', supplies)` | verbose but clear |
| generic only | `genContextBrainSupplier<'xai', T>(supplies)` | cleaner call, slug in generic |
| builder pattern | `genContextBrainSupplier.for('xai')(supplies)` | chainable |

recommendation: explicit slug arg for runtime key construction:

```ts
export const genContextBrainSupplier = <TSlug extends string, TSupplies>(
  slug: TSlug,
  supplies: TSupplies,
): ContextBrainSupplier<TSlug, TSupplies> => ({
  [`brain.supplier.${slug}`]: supplies,
} as ContextBrainSupplier<TSlug, TSupplies>);
```

---

## current workaround in rhachet-brains-xai

until rhachet publishes these types, we use:

1. local `ContextBrainSupplier` in `src/_topublish/rhachet/`
2. inline type with optional key: `{ 'brain.supplier.xai'?: BrainSuppliesXai }`
3. `asContext()` helper in tests to assert type compatibility

these work but create drift between vision and implementation.

---

## after rhachet publishes

rhachet-brains-xai will:

1. remove `src/_topublish/rhachet/ContextBrainSupplier.ts`
2. import `ContextBrainSupplier` from `rhachet`
3. remove `asContext()` helper from tests
4. use proper generic context on `ask()` signature

---

## references

- vision: `.behavior/v2026_03_19.fix-creds/1.vision.md`
- blueprint: `.behavior/v2026_03_19.fix-creds/3.3.1.blueprint.product.v1.i1.md`
- implementation: `src/domain.operations/atom/genBrainAtom.ts`

