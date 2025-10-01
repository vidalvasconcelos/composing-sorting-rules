# Composable Multi‑Criteria Sorting with fp-ts

This repository shows how to model, derive, and compose ordering (sorting) rules using the `Ord` abstractions from [`fp-ts`](https://github.com/gcanti/fp-ts). The focus is on expressing multi-criteria sorting declaratively and **incrementally reusing** smaller building blocks.

## Why Care About Composition?
Traditional sorting code tends to be ad‑hoc: one long comparison function with nested `if` / `else` branches. That approach is:
- Hard to extend (adding a new tie‑breaker risks breaking existing logic)
- Hard to test in isolation (all concerns tangled together)
- Imperative (focuses on control flow instead of intent)

`fp-ts/Ord` lets us:
1. Start with primitive orderings (e.g. built‑in `string` ordering)
2. Lift them to our domain types via `contramap`
3. Combine many `Ord` instances (lexicographically) with the `Monoid` for `Ord`
4. Reuse previously defined orderings across domains

Result: Each rule states *what* we sort by, not *how* to juggle comparisons.

## Domain Model
```typescript
interface Category {
  readonly id: string;
  readonly name: string
}

interface Product {
  readonly id: string;
  readonly name: string;
  readonly category: Category;
}
```
(See the real definitions in `src/categories/category.ts` and `src/products/product.ts`).

## Atomic (Primitive) Orderings
We start from the canonical `string` ordering exported as `s.Ord`:
```typescript
import * as s from 'fp-ts/string';
// s.Ord : Ord<string>
```

## Lifting with contramap
`contramap` lets us focus an `Ord<A>` onto a structure `B` by providing a projection `B -> A`.

```typescript
import * as Ord from 'fp-ts/Ord';
import { pipe } from 'fp-ts/function';
import * as s from 'fp-ts/string';

// Category ordering by name
export const ordCategoriesAlphabetically = pipe(
  s.Ord,
  Ord.contramap((c: Category) => c.name),
);

// Product ordering by *its own* name
export const ordProductsAlphabeticallyByName = pipe(
  s.Ord,
  Ord.contramap((p: Product) => p.name),
);

// Product ordering by *its category* (reusing Category ordering!)
export const ordProductsAlphabeticallyByCategory = pipe(
  ordCategoriesAlphabetically,
  Ord.contramap((p: Product) => p.category),
);
```
Notice how `ordProductsAlphabeticallyByCategory` **reuses** the category ordering—if later we change how categories are ordered (e.g. case‑insensitive), every dependent ordering benefits automatically.

## Composing Multiple Criteria
We often need “sort by Category name, then by Product name”. Instead of hand‑writing branching logic, we use the `Monoid` for `Ord` which combines orderings lexicographically:

```typescript
import { concatAll } from 'fp-ts/Monoid';

export const ordProducts = concatAll(Ord.getMonoid<Product>())([
  ordProductsAlphabeticallyByCategory, // primary key
  ordProductsAlphabeticallyByName,     // secondary (tie‑breaker)
]);
```
How it works:
- The Monoid’s `concat` tries the first `Ord`.
- If it returns `0` (values considered equal w.r.t. that criterion), it delegates to the next.
- This yields a left‑to‑right lexicographic chain you can extend safely.

### Adding New Tie‑Breakers
Need a deterministic final rule? Add an `Ord` on `id`:
```typescript
export const ordProductsAlphabeticallyById = pipe(
  s.Ord,
  Ord.contramap((p: Product) => p.id),
);

export const ordProductsStable = concatAll(Ord.getMonoid<Product>())([
  ordProductsAlphabeticallyByCategory,
  ordProductsAlphabeticallyByName,
  ordProductsAlphabeticallyById, // ensures a total, deterministic ordering
]);
```
No existing code modified—only appended.

## Putting It To Use
Example usage in plain TypeScript:
```typescript
import { ordProducts } from './src/products';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';

// Suppose we have an in‑memory list
const products: Product[] = [ /* ... */ ];

// Turn the Ord into a comparison function for native Array#sort
const sortedNative = [...products].sort(ordProducts.compare);

// Or stay purely functional using fp-ts Array utilities
const sortedFunctional = pipe(products, A.sort(ordProducts));
```

## Mental Model Recap
| Concept | Role |
|---------|------|
| `Ord<A>` | Describes total ordering for `A` |
| `contramap` | Derives an `Ord<B>` from `Ord<A>` + `B -> A` |
| `Monoid` for `Ord` | Lexicographically chains multiple orderings |
| Reuse | Small `Ord` blocks compose; changes propagate | 

## Benefits Achieved
- Declarative: Each rule is a tiny, intention‑revealing value.
- Extensible: New criteria = append to the list, not edit internals.
- Reusable: Category ordering reused inside product ordering.
- Testable: Each `Ord` can be property‑tested (antisymmetry, transitivity, totality).
- Maintainable: Change a projection once; consumers automatically adopt it.

## Implementation Map
| File | Key Exports |
|------|-------------|
| `src/categories/category.ts` | `Category`, `ordCategoriesAlphabetically` |
| `src/products/product.ts` | `Product`, `ordProductsAlphabeticallyByName`, `ordProductsAlphabeticallyByCategory`, `ordProducts` |

## Extending Further (Ideas)
- Case‑insensitive ordering: wrap `c.name.toLocaleLowerCase()`.
- Locale / collation awareness via `Intl.Collator` to handle diacritics.
- Optional / nullable fields: compose with `Ord` instances that push `null` to start/end.
- Reverse ordering: `Ord.reverse(ordProducts)` for descending variants.
- Derive ordering for tuples: `Ord.tuple(ordA, ordB, ...)` when structure already decomposes.

## Next Steps (If You Want More)
- Add property‑based tests with `fast-check` (not yet included) to assert ordering laws.
- Provide a benchmark comparing chained `Ord` vs bespoke comparator.
- Publish as a small package exposing reusable helpers for common multi‑criteria patterns.

## Minimal Setup
Install dependencies:
```bash
npm install
```
(No runtime scripts are defined—import the source in your own project or REPL.)

## Glossary
- Lexicographic Composition: Compare by first criterion; if equal, move to next.
- Projection (aka accessor): A function extracting the primitive value used for ordering.
- Total Ordering: Every pair of elements is comparable (no incomparable states).
