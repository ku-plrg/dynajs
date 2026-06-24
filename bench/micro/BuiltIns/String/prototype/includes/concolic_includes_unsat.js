// @type concolic
// @target es6+ String.prototype.includes
// @feature builtin includes
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.includes('abc')) {
    // @witness the includes('abc') guard forces length>=3
    __IS_SAT__(symbolic.length < 3, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
