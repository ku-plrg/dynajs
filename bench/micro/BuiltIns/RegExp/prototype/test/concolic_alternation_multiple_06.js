// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-alternation

function __test_symbolic__(symbolic) {
  if (/^Whats Up|Alice|Bob$/.test(symbolic)) {
    // @witness __test_symbolic__("Alice")
    __IS_SAT__(symbolic === "Alice", true);
  }
}

__test_symbolic__(__symbolic__('s', "Alice"));
