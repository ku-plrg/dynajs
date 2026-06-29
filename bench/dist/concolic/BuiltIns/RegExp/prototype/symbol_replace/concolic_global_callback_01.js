// @type concolic
// @target es5 String.prototype.replace
// @feature builtin regexp-replace-global-callback

function __test_symbolic__(symbolic) {
  if (symbolic.length <= 10) {
    var y = symbolic.replace(/He(l)lo/g, function (zero, one) {
      return one;
    });
    // @witness __test_symbolic__("Hello")
    __IS_SAT__(y === "l", true);
  }
}

__test_symbolic__(__symbolic__("s", "HELLO"));
