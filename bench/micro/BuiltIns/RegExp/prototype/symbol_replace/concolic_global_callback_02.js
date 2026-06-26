// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-global-callback

function __test_symbolic__(symbolic) {
  if (symbolic.length <= 10) {
    var y = symbolic.replace(/He(l)lo/g, function (zero, one) {
      return one;
    });

    // @witness __test_symbolic__("HelloHello")
    __IS_SAT__(y === "ll", true);
  }
}

__test_symbolic__(__symbolic__("s", "HELLOHELLO"));
