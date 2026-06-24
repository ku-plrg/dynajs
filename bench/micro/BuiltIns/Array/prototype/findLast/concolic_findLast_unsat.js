// @type concolic
// @target es6+ Array.prototype.findLast
// @feature builtin findLast

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic[1] > 10) {
    // @witness the last element matches, so findLast returns element 1
    __IS_SAT__(symbolic.findLast(function (v) { return v > 10; }) !== symbolic[1], false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 11]));
