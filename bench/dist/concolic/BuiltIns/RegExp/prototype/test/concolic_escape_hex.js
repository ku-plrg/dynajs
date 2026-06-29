// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-escape

function __test_symbolic__(symbolic) {
  if (/^\xFF$/.test(symbolic)) {
    // @witness /^\xFF$/ anchors the whole string to exactly "\xFF", so symbolic !== "\xFF" can never hold on this path
    __IS_SAT__(symbolic !== "\xFF", false);
  }
  if (/^\xEF$/.test(symbolic)) {
    // @witness /^\xEF$/ anchors the whole string to exactly "\xEF", so symbolic !== "\xEF" can never hold on this path
    __IS_SAT__(symbolic !== "\xEF", false);
  }
  if (/^\0$/.test(symbolic)) {
    // @witness /^\0$/ anchors the whole string to exactly the NUL char "\x00", so symbolic !== "\x00" can never hold on this path
    __IS_SAT__(symbolic !== "\x00", false);
  }
}

__test_symbolic__(__symbolic__("s", "\xFF"));
