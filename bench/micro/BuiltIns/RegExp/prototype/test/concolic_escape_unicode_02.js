// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-escape

function __test_symbolic__(symbolic) {
  if (/^ꪪ$/.test(symbolic)) {
    // @witness /^ꪪ$/ anchors the whole string to exactly "ꪪ", so symbolic !== "ꪪ" can never hold on this path
    __IS_SAT__(symbolic !== "ꪪ", false);
  }
}

__test_symbolic__(__symbolic__("s", "ꪪ"));
