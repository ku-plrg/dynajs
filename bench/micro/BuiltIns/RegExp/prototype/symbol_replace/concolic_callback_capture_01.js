// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-callback-capture

function __test_symbolic__(symbolic) {
  symbolic.replace(/^.+(.).+/, function (zero, one) {
    // @witness __test_symbolic__("xpx")
    __IS_SAT__(one === "p", true);
  });
}

__test_symbolic__(__symbolic__("s", "xpx"));
