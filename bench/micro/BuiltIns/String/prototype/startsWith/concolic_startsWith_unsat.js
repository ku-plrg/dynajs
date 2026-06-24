// @type concolic
// @target es6+ String.prototype.startsWith
// @feature builtin startsWith
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.startsWith('abc')) {
    // @witness startsWith('abc') forces a 3-char prefix, so length>=3
    __IS_SAT__(symbolic.length < 3, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
