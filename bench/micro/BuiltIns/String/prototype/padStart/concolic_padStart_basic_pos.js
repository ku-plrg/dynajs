// @type concolic
// @target es6+ String.prototype.padStart
// @feature builtin padStart
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.padStart(4, '.');
  if (symbolic.length === 4) {
    // @witness when length already equals the target, padStart returns the source unchanged
    __symbolic_assert__(r === symbolic, true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abcd"));
