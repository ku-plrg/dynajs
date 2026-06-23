// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-global-anchored

function __test_symbolic__(symbolic) {
  if (symbolic.length < 5) {
    if (symbolic !== "Test" && symbolic.replace(/^a|b$/g, "Test") === "Test") {
      // @witness replace(/^a|b$/g,"Test")==="Test" forces the whole string to be "a" or "b", so it can never contain both "a" and "b"
      __IS_SAT__(symbolic.indexOf("a") !== -1 && symbolic.indexOf("b") !== -1, false);
    }
  }
}

__test_symbolic__(__symbolic__("s", "a"));
