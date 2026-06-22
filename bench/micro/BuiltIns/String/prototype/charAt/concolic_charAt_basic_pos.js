// @type concolic
// @target es5 String.prototype.charAt
// @feature builtin charAt
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.charAt(0) === 'a' && symbolic.charAt(1) === 'b') {
    //@witness index 2 to exist, so length>=2
    __symbolic_assert__(symbolic.length >= 2, true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
