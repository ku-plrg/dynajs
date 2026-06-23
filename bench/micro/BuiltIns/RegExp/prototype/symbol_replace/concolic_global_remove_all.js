// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-global-remove-all

function __test_symbolic__(symbolic) {
  if (symbolic.length > 4 && symbolic.replace(/hello/g, "") === "") {
    // @witness the guard removes every "hello" yet leaves "", so the string is all "hello"s and indexOf can never be -1
    __IS_SAT__(symbolic.indexOf("hello") === -1, false);
  }
}

__test_symbolic__(__symbolic__("s", "hello"));
