// super() with no args
class A {
  constructor() { this.x = 1; }
}
class B extends A {
  constructor() { super(); this.y = 2; }
}
const b = new B();
console.log(b.x + b.y);
