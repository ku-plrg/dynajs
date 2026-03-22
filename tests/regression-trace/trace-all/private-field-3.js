class C {
  #x = 0;
  f() { return this.#x; }
}
var c = new C();
c.f();
