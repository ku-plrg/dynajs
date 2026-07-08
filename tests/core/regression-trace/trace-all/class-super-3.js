// super.prop read (not a method call)
class A {
  get tag() { return 'animal'; }
}
class B extends A {
  describe() { return 'I am a ' + super.tag; }
}
const b = new B();
console.log(b.describe());
