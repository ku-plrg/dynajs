// @type concolic
// @target es6+ Array.prototype.entries
// @feature builtin entries
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.entries().next().value[1] === 5) {
    // @witness the first entry is [0, symbolic[0]], so its value component pins symbolic[0] to 5
    __IS_SAT__(symbolic[0] !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [5]));
