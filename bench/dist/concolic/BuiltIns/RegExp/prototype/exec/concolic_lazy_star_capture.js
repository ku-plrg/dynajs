// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  var b = /^(a)*?a$/.exec(symbolic);
  if (b != null) {
    if (symbolic === "a") {
      // @witness the guard pins the string to exactly "a", and the lazy (a)*? matches zero copies so the trailing literal a consumes the only "a", leaving group 1 unset (never "a")
      __IS_SAT__(b[1] === "a", false);
    }
  }
}

__test_symbolic__(__symbolic__("s", "a"));
