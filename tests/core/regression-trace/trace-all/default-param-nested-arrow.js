function f(g = (_type, message) => message) {
  return g("ignored", 42);
}

f();
