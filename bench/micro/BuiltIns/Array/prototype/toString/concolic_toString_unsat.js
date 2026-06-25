// @type concolic
// @target es5 Array.prototype.toString
// @feature builtin toString

function __test_symbolic__(symbolic) {
  if (symbolic.toString().length >= 1) {
    // @witness a non-empty toString output requires at least one source element, so length < 1 is impossible
    __IS_SAT__(symbolic.length < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
