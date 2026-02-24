function f(a, b, {c, d, ...rest}) {
  return rest;
}

f(1, 2, {c: 3, d: 4, e: 5, f: 6});