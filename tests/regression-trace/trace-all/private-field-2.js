class C {
  #x = 0;
  setX(v) { this.#x = v; }
}
var c = new C();
c.setX(5);
