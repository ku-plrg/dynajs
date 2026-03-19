class A {
  set 1(v) {
    this.value = v;
  }
}

const a = new A();
a[1] = 4;
print(a.value);
