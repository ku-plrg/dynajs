// @type concolic
// @target es6+ String.prototype.toWellFormed
// @feature builtin toWellFormed
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.length === 3) {
    // @witness toWellFormed preserves length, so the length===3 guard fixes it at 3
    __IS_SAT__(symbolic.toWellFormed().length !== 3, false);
  } else {
    __IS_SAT__(true, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
