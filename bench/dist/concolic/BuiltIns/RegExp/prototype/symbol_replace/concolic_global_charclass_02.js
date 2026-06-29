// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-global-charclass

function __test_symbolic__(symbolic) {
  symbolic = symbolic.replace(/(a|b)/g, "q");

  // @witness global /(a|b)/g replaces every b with "q", so result never contains "b"
  __IS_SAT__(symbolic.indexOf("b") !== -1, false);
}

__test_symbolic__(__symbolic__("s", "q"));
