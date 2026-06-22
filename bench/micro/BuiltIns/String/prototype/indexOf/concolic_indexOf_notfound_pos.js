// @type concolic
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.indexOf('z') === -1) {
    // @witness indexOf returns -1 only when 'z' is absent, so char 0 is not 'z'
    __symbolic_assert__(symbolic[0] !== 'z', true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
