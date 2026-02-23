function* gen() {
  let x = yield 1;
  let y = yield x;
  return y;
}

var g = gen();
g.next(4);
g.next(5);
g.next(6);