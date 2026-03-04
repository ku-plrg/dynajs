var obj = {
  tag: function tag(strings, a, b) {
    return strings[0] + a + strings[1] + b + strings[2];
  }
};
(obj?.tag)`hello ${'world'} and ${42}!`;
