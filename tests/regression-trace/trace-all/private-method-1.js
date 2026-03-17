class C {
  #double(n) { return n * 2; }
  compute(n) { return this.#double(n); }
}
var c = new C();
c.compute(3);
