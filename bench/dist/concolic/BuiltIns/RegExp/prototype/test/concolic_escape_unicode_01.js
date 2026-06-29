// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-escape

function __test_symbolic__(symbolic) {
  if (/^$/.test(symbolic)) {
    // @witness /^$/ anchors the whole string to exactly "", so symbolic !== "" can never hold on this path
    __IS_SAT__(symbolic !== "", false);
  }
}

__test_symbolic__(__symbolic__("s", ""));
