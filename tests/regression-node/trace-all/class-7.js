class A {
  *"m"() {
    yield 6;
  }
}

print(new A()["m"]().next().value);
