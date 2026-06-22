// @type concolic
// @target es5 String.prototype.valueOf
// @feature builtin valueOf
// @done

function __test_symbolic__(symbolic) {

  if (symbolic.valueOf() === 'ab') {
    // @witness valueOf returns the string itself, so it equals the source
    __symbolic_assert__(symbolic === 'ab', true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "ab"));
