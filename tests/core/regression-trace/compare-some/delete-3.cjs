try {
    delete Number.EPSILON;
} catch (e) {
  if (!(e instanceof TypeError)) {
    throw new Error("Expected TypeError, got " + e);
  }
}