# Composable Sorting with fp-ts

This repository demonstrates how to compose sort rules using the fp-ts Ord module, showcasing the power and elegance of functional programming principles.

## Overview

In functional programming, composability is a fundamental concept that allows us to build complex behaviors from simple, reusable components. This project illustrates how to create and compose sorting rules for different data types using the `Ord` module from the fp-ts library.

## Examples

### Basic Sorting

The repository contains examples for sorting both `Category` and `Product` types:

#### Category Sorting

```typescript
import * as Ord from 'fp-ts/Ord';
import * as s from 'fp-ts/string';
import {pipe} from "fp-ts/function";
import {Category} from "./category";

/**
 * This function sorts the categories alphabetically by name.
 */
export const categoriesAlphabeticallyOrdByName: Ord.Ord<Category> = pipe(
  s.Ord,
  Ord.contramap((coupon: Category): string => coupon.name),
)
```

This creates a sorting function that orders categories alphabetically by their name property.

#### Product Sorting

For products, we have multiple sorting criteria:

```typescript
/**
 * This function is used to sort products by their name
 * in ascending order.
 */
export const productsAlphabeticallyOrdByName: Ord.Ord<Product> = pipe(
  s.Ord,
  Ord.contramap((product: Product): string => product.name.toString()),
)

/**
 * This function is used to sort products by their category
 * in ascending order.
 */
export const productsAlphabeticallyOrdByCategory: Ord.Ord<Product> = pipe(
  categoriesAlphabeticallyOrdByName,
  Ord.contramap((product: Product) => product.category),
)
```

### The Power of Composition

The real magic happens when we compose these sorting functions together:

```typescript
/**
 * This functions is used to consolidate the product sort rules.
 */
export const productsOrd = concatAll(Ord.getMonoid())([
  productsAlphabeticallyOrdByCategory,
  productsAlphabeticallyOrdByName,
])
```

This creates a composite sorting function that first sorts products by their category name, and then by their own name when categories are the same. The composition is achieved using the `concatAll` function from fp-ts/Monoid, which combines multiple `Ord` instances into a single one.

## Why Composability Matters

Composability is a cornerstone of functional programming for several reasons:

1. **Reusability**: Each sorting function can be used independently or as part of a larger composition.
2. **Maintainability**: Simple, focused functions are easier to understand, test, and maintain.
3. **Flexibility**: New sorting criteria can be added without modifying existing code.
4. **Declarative Style**: The code expresses what to do rather than how to do it, making it more readable.

In our example, we can see how the `categoriesAlphabeticallyOrdByName` function is reused in the `productsAlphabeticallyOrdByCategory` function, demonstrating how composability promotes code reuse.

## Testing

The repository includes property-based tests using fast-check to verify the sorting behavior:

```typescript
it('Should sort Products by Category and name', function () {
  fc.assert(
    fc.property(product, product, product, product, function (...products: Product[]) {
      const result = products.sort(productsOrd.compare)

      for (let i = 0, j = 1; i < result.length - 1; i++, j++) {
        assert.ok(
          s.Ord.compare(result[i].category.name, result[j].category.name) <= 0,
          `Product in category ${result[i].category.name} must come before the Product in category ${result[j].name}`
        )

        if (result[i].category.name === result[j].category.name) {
          assert.ok(
            s.Ord.compare(result[i].name, result[j].name) <= 0,
            `Product ${result[i].name} must come before Product ${result[j].name}`
          )
        }
      }
    }),
  );
});
```

These tests ensure that our composed sorting functions work as expected.

## Conclusion

This repository demonstrates how the fp-ts library, particularly the Ord module, enables the creation of composable sorting rules. By leveraging functional programming principles, we can build complex sorting logic from simple, reusable components, resulting in code that is more maintainable, flexible, and expressive.

The ability to compose functions is not just a technical feature but a powerful design principle that leads to better software architecture. As shown in this example, composability allows us to express complex business rules in a clear, concise, and modular way.

## Notes

*Disclaimer: This README file was built by Junie, the pair programming tool from JetBrains.*
