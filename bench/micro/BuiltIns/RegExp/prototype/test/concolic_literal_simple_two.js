// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-literal

function __test_symbolic__(symbolic) {
  if (/^hello_world$/.test(symbolic)) {
    // @witness /^hello_world$/ anchors the whole string to exactly "hello_world", so symbolic !== "hello_world" can never hold on this path
    __IS_SAT__(symbolic !== "hello_world", false);
  }
}

__test_symbolic__(__symbolic__("s", "hello_world"));
