function f(a, b, [c, d, ...rest]) {
  return rest;
}

f(1, 2, [3, 4, 5, 6]);