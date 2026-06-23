// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-escape

function __test_symbolic__(symbolic) {
  if (/^攴$/.test(symbolic)) {
    // @witness /^攴$/ anchors the whole string to exactly "攴", so symbolic !== "攴" can never hold on this path
    __IS_SAT__(symbolic !== "攴", false);
  }
}

__test_symbolic__(__symbolic__("s", "攴"));
