class A {
  f(x) { return x + 1; }
}
class B extends A {
  g(x) { return x * 2; }
}
const b = new B;
b.f(3);
b.g(3);
