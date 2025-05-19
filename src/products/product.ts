import {Category} from "../categories";

export type Product = {
  readonly id: string;
  readonly name: string;
  readonly category: Category;
};
