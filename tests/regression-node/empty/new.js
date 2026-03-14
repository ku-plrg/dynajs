function constructOnly() {
  if (new.target === undefined) {
    throw new TypeError("constructOnly must be called with 'new'");
  }

  return {};
}

new constructOnly();
print("new is keeped");