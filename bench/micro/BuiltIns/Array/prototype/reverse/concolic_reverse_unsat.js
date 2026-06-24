// @type concolic
// @target es5 Array.prototype.reverse
// @feature builtin reverse

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var first = symbolic[0];
    symbolic.reverse();
    // @witness reverse moves the original first element to the last index
    __IS_SAT__(symbolic[1] !== first, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
