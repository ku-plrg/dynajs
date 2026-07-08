// super.prop write via setter
class A {
  set label(v) { this._label = v; }
  get label() { return this._label; }
}
class B extends A {
  setLabel(v) { super.label = v; }
}
const b = new B();
b.setLabel('dog');
console.log(b.label);
