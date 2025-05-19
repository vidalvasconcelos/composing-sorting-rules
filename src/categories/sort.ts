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
