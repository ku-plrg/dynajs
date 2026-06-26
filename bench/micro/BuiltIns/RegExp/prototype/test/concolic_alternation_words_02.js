// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-alternation

function __test_symbolic__(symbolic) {
  if (/^Hello|Goodbye|Whats Up$/.test(symbolic)) {
    // @witness __test_symbolic__("Goodbye")
    __IS_SAT__(symbolic === "Goodbye", true);
  }
}

__test_symbolic__(__symbolic__("s", "GoodbyeGoodbye"));
