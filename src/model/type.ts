export interface StringOps<Str> {
  length: (s: Str) => number;
  substring: (s: Str, start: number, end: number) => Str;
  concatenate: (s1: Str, s2: Str) => Str;
  is: (l: Str, r: Str) => boolean;
  empty: () => Str;
};

export interface ArrayOps<Arr, Elem> {
  createEmpty: () => Arr;
  append: (arr: Arr, element: Elem) => void;
  length: (arr: Arr) => number;
  get: (arr: Arr, index: number) => Elem;
};