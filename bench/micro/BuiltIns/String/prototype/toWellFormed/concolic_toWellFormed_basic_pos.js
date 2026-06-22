// @type concolic
// @target es6+ String.prototype.toWellFormed
// @feature builtin toWellFormed
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.length === 3) {
    // @witness toWellFormed preserves length, so a length-3 result means a length-3 source
    __symbolic_assert__(symbolic.toWellFormed().length === 3, true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
