// @type concolic
// @target es2023 Array.prototype.with
// @feature builtin with

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2) {
    var r = symbolic.with(0, 5);
    // @witness with(0, 5) returns a copy whose index 0 is 5
    __IS_SAT__(r[0] !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
