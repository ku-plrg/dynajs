class C {
  #x = 10;
  getX() { return this.#x; }
}
var c = new C();
c.getX();
