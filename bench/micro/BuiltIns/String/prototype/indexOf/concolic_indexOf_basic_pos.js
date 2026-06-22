// @type concolic
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @done

function __test_symbolic__(symbolic) {

  if (symbolic.indexOf('b') === 0) {
    // @witness 'b' first occurs at index 0, so char 0 is 'b'
    __symbolic_assert__(symbolic[0] === 'b', true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "bca"));
