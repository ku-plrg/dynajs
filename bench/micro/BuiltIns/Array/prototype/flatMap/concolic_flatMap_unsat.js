// @type concolic
// @target es6+ Array.prototype.flatMap
// @feature builtin flatMap
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.flatMap(function (v) { return [v]; }).length === 2) {
    // @witness each element maps to exactly one element, so a flatMap length of 2 forces source length 2
    __IS_SAT__(symbolic.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
