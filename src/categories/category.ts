import * as Ord from "fp-ts/Ord";
import {pipe} from "fp-ts/function";
import * as s from "fp-ts/string";

/**
 * A Category interface
 */
export interface Category {
  readonly id: string;
  readonly name: string;
}

/**
 * The ordering of categories alphabetically by name
 */
export const ordCategoriesAlphabetically: Ord.Ord<Category> = pipe(
  s.Ord,
  Ord.contramap((coupon: Category): string => coupon.name),
)
