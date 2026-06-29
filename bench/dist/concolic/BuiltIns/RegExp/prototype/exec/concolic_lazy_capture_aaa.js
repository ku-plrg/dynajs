// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  var b = /^[a-z]*?(aaa)$/.exec(symbolic);
  if (b != null) {
    // @witness anchored (aaa)$ forces group 1 to capture exactly "aaa" on every matching path, so b[1] can never differ from "aaa"
    __IS_SAT__(b[1] !== "aaa", false);
  }
}

__test_symbolic__(__symbolic__('s', "aaa"));
