// A -> B -> C, each calling super.speak()
class A {
  speak() { return 'A'; }
}
class B extends A {
  speak() { return super.speak() + 'B'; }
}
class C extends B {
  speak() { return super.speak() + 'C'; }
}
const c = new C();
console.log(c.speak());
