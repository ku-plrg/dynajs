// super.method() in a static method
class A {
  static greet() { return 'Hello from A'; }
}
class B extends A {
  static greet() { return super.greet() + ' and B'; }
}
console.log(B.greet());
