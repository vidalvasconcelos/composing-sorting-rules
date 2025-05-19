import * as fc from 'fast-check';
import * as s from 'fp-ts/string';
import * as assert from "node:assert/strict";
import {describe, it} from "node:test";
import {productsAlphabeticallyOrdByCategory, productsAlphabeticallyOrdByName, productsOrd} from "./sort";
import {categoryArb} from "../categories/sort.spec";
import {Product} from "./product";

const product: fc.Arbitrary<Product> = fc.record({
  id: fc.uuid(),
  name: fc.lorem({mode: 'words', maxCount: 1}),
  category: categoryArb
})

describe("Product commons", function () {
  it('Should sort Products alphabetically by name', function () {
    fc.assert(
      fc.property(product, product, product, function (...products: Product[]) {
        const result = products.sort(productsAlphabeticallyOrdByName.compare)

        for (let i = 0, j = 1; i < result.length - 1; i++, j++) {
          assert.ok(
            s.Ord.compare(result[i].name, result[j].name) <= 0,
            `Product ${result[i].name} must come before Product ${result[j].name}`
          )
        }
      }),
    );
  });

  it('Should sort Products alphabetically by category name', function () {
    fc.assert(
      fc.property(product, product, product, function (...products: Product[]) {
        const result = products.sort(productsAlphabeticallyOrdByCategory.compare)

        for (let i = 0, j = 1; i < result.length - 1; i++, j++) {
          assert.ok(
            s.Ord.compare(result[i].category.name, result[j].category.name) <= 0,
            `Product in category ${result[i].category.name} must come before the Product in category ${result[j].name}`
          )
        }
      }),
    );
  });

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
})
