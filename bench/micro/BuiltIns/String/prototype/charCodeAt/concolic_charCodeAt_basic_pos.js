// @type concolic
// @target es5 String.prototype.charCodeAt
// @feature builtin charCodeAt
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.charCodeAt(0) === 97) {
    //@witness index 1 to exist, so length>=1
    __symbolic_assert__(symbolic.length >= 1, true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
