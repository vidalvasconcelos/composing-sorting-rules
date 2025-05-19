import * as s from "fp-ts/string";
import * as fc from "fast-check";
import * as assert from "node:assert/strict";
import {describe, it} from "node:test";
import {Category} from "./category";
import {categoriesAlphabeticallyOrdByName} from "./sort";

export const categoryArb: fc.Arbitrary<Category> = fc.record({
  id: fc.uuid(),
  name: fc.lorem({mode: 'words', maxCount: 1}),
})

describe('Category commons', function () {
  it('Should sort Categories alphabetically by name', async function () {
    fc.assert(
      fc.property(categoryArb, categoryArb, categoryArb, function (...samples: Category[]) {
        const categories = samples.sort(categoriesAlphabeticallyOrdByName.compare)

        for (let i = 0, j = 1; i < categories.length - 1; i++, j++) {
          assert.ok(
            s.Ord.compare(categories[i].name, categories[j].name) <= 0,
            `Category ${categories[i].name} must come before Category ${categories[j].name}`
          )
        }
      }),
    );
  });
})


