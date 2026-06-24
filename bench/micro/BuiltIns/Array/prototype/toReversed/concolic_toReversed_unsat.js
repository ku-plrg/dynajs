// @type concolic
// @target es6+ Array.prototype.toReversed
// @feature builtin toReversed

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.toReversed();
    // @witness toReversed copies elements in reverse, so its index 0 is the source's last element
    __IS_SAT__(r[0] !== symbolic[1], false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
