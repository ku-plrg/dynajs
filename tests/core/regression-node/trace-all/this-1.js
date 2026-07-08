const obj = {
  x: 1,
  f() {
    return ((cb) => cb())(() => this.x);
  }
};
assert(obj.f() === 1);