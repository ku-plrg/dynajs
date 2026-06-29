// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-escape

function __test_symbolic__(symbolic) {
  if (/^䊿$/.test(symbolic)) {
    // @witness /^䊿$/ anchors the whole string to exactly "䊿", so symbolic !== "䊿" can never hold on this path
    __IS_SAT__(symbolic !== "䊿", false);
  }
}

__test_symbolic__(__symbolic__("s", "䊿"));
