// @type concolic
// @target es6+ RegExp.prototype[Symbol.match]
// @feature builtin regexp-match-sticky-loop

function __test_symbolic__(symbolic) {
  var re = /hello/y;
  if (symbolic.length < 15) {
    while (symbolic.match(re)) {
    }
    // @witness __test_symbolic__("5")
    __IS_SAT__(symbolic > 3, true);
  }
}

__test_symbolic__(__symbolic__("s", ""));
