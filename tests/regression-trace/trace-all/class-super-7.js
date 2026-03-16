// super[methodName]() computed call
class A {
  foo() { return 42; }
}
class B extends A {
  bar() {
    const m = 'foo';
    return super[m]();
  }
}
const b = new B();
console.log(b.bar());
