// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-literal

function __test_symbolic__(symbolic) {
  if (/^a$/.test(symbolic)) {
    // @witness /^a$/ anchors the whole string to exactly "a", so symbolic !== "a" can never hold on this path
    __IS_SAT__(symbolic !== "a", false);
  }
}

__test_symbolic__(__symbolic__("s", "a"));
