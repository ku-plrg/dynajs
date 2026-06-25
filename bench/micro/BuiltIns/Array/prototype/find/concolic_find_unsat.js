// @type concolic
// @target es6+ Array.prototype.find
// @feature builtin find
// @done

function __test_symbolic__(symbolic) {
  if (symbolic[0] > 10) {
    // @witness element 0 already satisfies v>10, so find returns it
    __IS_SAT__(symbolic.find(function (v) { return v > 10; }) !== symbolic[0], false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [11]));
