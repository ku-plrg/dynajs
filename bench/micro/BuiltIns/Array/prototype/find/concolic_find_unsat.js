// @type concolic
// @target es6+ Array.prototype.find
// @feature builtin find
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.find(function (v) { return v > 10; }) === symbolic[0]) {
    // @witness find returns symbolic[0] only when it is the first element satisfying v>10, so symbolic[0] > 10
    __IS_SAT__(symbolic[0] <= 10, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [11]));
