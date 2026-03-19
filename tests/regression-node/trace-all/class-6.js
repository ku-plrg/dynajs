class A {
  async "m"() {
    return 5;
  }
}

print(await new A()["m"]());
