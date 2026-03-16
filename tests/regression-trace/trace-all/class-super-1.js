// super() call in constructor + super.method() call
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return this.name + ' makes a noise.';
  }
}
class Dog extends Animal {
  constructor(name) {
    super(name);
  }
  speak() {
    return super.speak() + ' Woof!';
  }
}
const d = new Dog('Rex');
console.log(d.speak());
