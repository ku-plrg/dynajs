// @type concolic
// @target es6+ Array.prototype.entries
// @feature builtin entries
// @done

function __test_symbolic__(symbolic) {
  if (symbolic[0] === 5) {
    var first = symbolic.entries().next().value;
    // @witness the first entry pairs index 0 with element 0, which the guard pins to 5
    __IS_SAT__(first[1] !== 5, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [5]));
