// @type concolic
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.startsWith('abc')) {
    // @witness starting with 'abc' (3 chars) forces length >= 3
    __symbolic_assert__(symbolic.length >= 3, true);  
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
