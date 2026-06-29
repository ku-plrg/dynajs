// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-test-unicode

function __test_symbolic__(symbolic) {
  if (/^\u{64}$/u.test(symbolic)) {
    // @witness /^\u{64}$/u anchors the whole string to exactly "d", so symbolic !== "d" can never hold on this path
    __IS_SAT__(symbolic !== "d", false);
  }
}

__test_symbolic__(__symbolic__("s", "d"));
