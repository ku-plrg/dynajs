class A {
  constructor(x) {
    this.x = x;
  }
  ['h' + 'i']() { return this.x; }
}
const a = new A(42);
a.hi();
