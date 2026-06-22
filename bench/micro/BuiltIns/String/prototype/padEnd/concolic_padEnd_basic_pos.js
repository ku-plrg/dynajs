// @type concolic
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd
// @done

function __test_symbolic__(symbolic) {

  var r = symbolic.padEnd(4, '.');
  if (symbolic.length === 4) {
    // @witness when length already equals the target, padEnd returns the source unchanged
    __symbolic_assert__(r === symbolic, true);
  } else {
    __symbolic_assert__(false, true);
  }

}

__test_symbolic__(__symbolic__('s', "abcd"));
