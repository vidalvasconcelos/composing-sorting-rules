import * as Ord from 'fp-ts/Ord';
import * as s from 'fp-ts/string';
import {pipe} from "fp-ts/lib/function";
import {categoriesAlphabeticallyOrdByName} from "../categories";
import {Product} from "./product";
import {concatAll} from "fp-ts/Monoid";

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


/**
 * This functions is used to consolidate the product sort rules.
 */
export const productsOrd = concatAll(Ord.getMonoid())([
  productsAlphabeticallyOrdByCategory,
  productsAlphabeticallyOrdByName,
])
