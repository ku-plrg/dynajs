class A {
  get x() { return this.y + 1; }
  set x(k) { this.y = k * 2; }
}
const a = new A;
a.x = 13;
a.x;
