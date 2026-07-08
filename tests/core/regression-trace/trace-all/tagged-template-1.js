function tag(strings, a, b) {
  return strings[0] + a + strings[1] + b + strings[2];
}
tag`hello ${'world'} and ${42}!`;
