// @type concolic
// @target es5 Array.prototype.map
// @feature builtin map
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.map(function (v) { return v * 2; }).length === 2) {
    // @witness map produces exactly one element per source element, so a result length of 2 forces source length 2
    __IS_SAT__(symbolic.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
