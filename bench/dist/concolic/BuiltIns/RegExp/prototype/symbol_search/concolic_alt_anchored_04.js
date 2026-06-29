// @type concolic
// @target es5 String.prototype.search
// @feature builtin regexp-search-alt-anchored

function __test_symbolic__(symbolic) {
  var nl = symbolic.search(/^(a|b)$/);
  if (nl !== -1) {
    // @witness the anchored alternation admits only a|b, so a guard-passer outside that set cannot exist
    __IS_SAT__(!(symbolic === "a" || symbolic === "b"), false);
  }
}

__test_symbolic__(__symbolic__("s", "a"));
