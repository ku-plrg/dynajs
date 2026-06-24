// @type concolic
// @target es6+ Array.from
// @feature builtin from

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = Array.from(symbolic);
    // @witness Array.from copies every element, so the result keeps length 2
    __IS_SAT__(r.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
