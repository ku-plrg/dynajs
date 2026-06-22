// @type concolic
// @target es5 String.prototype.slice
// @feature builtin slice
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.slice(1, 3) === 'bc') {
    // @witness for in-range positive slice, char 1 is 'b' and char 2 is 'c'
    __symbolic_assert__(symbolic[1] === 'b' && symbolic[2] === 'c', true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
