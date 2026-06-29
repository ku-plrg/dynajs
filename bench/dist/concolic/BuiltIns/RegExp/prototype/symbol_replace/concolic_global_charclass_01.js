// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-global-charclass

function __test_symbolic__(symbolic) {
  symbolic = symbolic.replace(/(a|b)/g, "q");
  // @witness global /(a|b)/g replaces every a with "q", so result never contains "a"
  __IS_SAT__(symbolic.indexOf("a") !== -1, false);
}

__test_symbolic__(__symbolic__("s", "q"));
