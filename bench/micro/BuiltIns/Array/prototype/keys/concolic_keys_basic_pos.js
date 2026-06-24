// @type concolic
// @target es6+ Array.prototype.keys
// @feature builtin keys

function __test_symbolic__(symbolic) {
  if (symbolic.length >= 1) {
    // @witness keys() yields positions, so the first key is always 0
    __IS_SAT__(symbolic.keys().next().value !== 0, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [7]));
