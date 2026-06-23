// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-escape

function __test_symbolic__(symbolic) {
  if (/^\f$/.test(symbolic)) {
    // @witness /^\f$/ anchors the whole string to exactly the form-feed char "\f", so symbolic !== "\f" can never hold on this path
    __IS_SAT__(symbolic !== "\f", false);
  }
  if (/^[\b]$/.test(symbolic)) {
    // @witness /^[\b]$/ anchors the whole string to exactly the backspace char "\b", so symbolic !== "\b" can never hold on this path
    __IS_SAT__(symbolic !== "\b", false);
  }
  if (/^\t$/.test(symbolic)) {
    // @witness /^\t$/ anchors the whole string to exactly the tab char "\t", so symbolic !== "\t" can never hold on this path
    __IS_SAT__(symbolic !== "\t", false);
  }
  if (/^\v$/.test(symbolic)) {
    // @witness /^\v$/ anchors the whole string to exactly the vertical-tab char "\v", so symbolic !== "\v" can never hold on this path
    __IS_SAT__(symbolic !== "\v", false);
  }
  if (/^\n$/.test(symbolic)) {
    // @witness /^\n$/ anchors the whole string to exactly the newline char "\n", so symbolic !== "\n" can never hold on this path
    __IS_SAT__(symbolic !== "\n", false);
  }
}

__test_symbolic__(__symbolic__("s", "\f"));
