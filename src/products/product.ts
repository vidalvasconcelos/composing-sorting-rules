import * as Ord from "fp-ts/Ord";
import * as s from "fp-ts/string";
import {pipe} from "fp-ts/function";
import {concatAll} from "fp-ts/Monoid";
import {Category, ordCategoriesAlphabetically} from "../categories";

/**
 * A Product interface
 */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly category: Category;
};

/**
 * The Ord instance to sort products alphabetically by name.
 */
export const ordProductsAlphabeticallyByName: Ord.Ord<Product> = pipe(
  s.Ord,
  Ord.contramap((product: Product): string => product.name.toString()),
)

/**
 * The Ord instance to sort products alphabetically by Category.
 */
export const ordProductsAlphabeticallyByCategory: Ord.Ord<Product> = pipe(
  ordCategoriesAlphabetically,
  Ord.contramap((product: Product) => product.category),
)

/**
 * The Ord instance to sort products.
 */
export const ordProducts = concatAll(Ord.getMonoid())([
  ordProductsAlphabeticallyByCategory,
  ordProductsAlphabeticallyByName,
])
