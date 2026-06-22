// @type concolic
// @target es6+ String.prototype.includes
// @feature builtin includes
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.includes('abc')) {
    // @witness containing 'abc' (3 chars) forces length >= 3
    __symbolic_assert__(symbolic.length >= 3, true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
