// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-string-literal

function __test_symbolic__(symbolic) {
  if (symbolic.length > 0 && symbolic !== "hello" && symbolic.replace("h...o", "") === "") {
    // @witness the guard requires length > 0, so length === 0 is unsatisfiable on this path
    __IS_SAT__(symbolic.length === 0, false);
  }
}

__test_symbolic__(__symbolic__("s", "h...o"));
