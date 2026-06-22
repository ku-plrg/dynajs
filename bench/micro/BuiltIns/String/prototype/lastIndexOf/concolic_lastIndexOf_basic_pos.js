// @type concolic
// @target es5 String.prototype.lastIndexOf
// @feature builtin lastIndexOf
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.lastIndexOf('b') === 2) {
    // @witness 'b' last occurs at index 2, so char 2 is 'b'
    __symbolic_assert__(symbolic[2] === 'b', true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "aab"));
