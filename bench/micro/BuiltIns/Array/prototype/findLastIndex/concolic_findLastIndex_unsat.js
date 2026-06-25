// @type concolic
// @target es6+ Array.prototype.findLastIndex
// @feature builtin findLastIndex
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic[1] > 10) {
    // @witness the last element matches, so findLastIndex returns 1
    __IS_SAT__(symbolic.findLastIndex(function (v) { return v > 10; }) !== 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 11]));
