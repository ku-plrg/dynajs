// @type concolic
// @target es5 Array.prototype.forEach
// @feature builtin forEach
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var sum = 0;
    symbolic.forEach(function (v) { sum += v; });
    // @witness forEach visits both elements, so the running sum equals element0 + element1
    __IS_SAT__(sum !== symbolic[0] + symbolic[1], false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
