// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-alternation

function __test_symbolic__(symbolic) {
  if (/^Cookey|Hello|Whats Up$/.test(symbolic)) {
    // @witness __test_symbolic__("xHellox")
    __IS_SAT__(!(symbolic === "Cookey" || symbolic === "Hello" || symbolic === "Whats Up"), true);
  }
}

__test_symbolic__(__symbolic__('s', "xHellox"));
