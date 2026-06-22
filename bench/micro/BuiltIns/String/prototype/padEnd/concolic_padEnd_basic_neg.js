// @type concolic
// @target es6+ String.prototype.padEnd
// @feature builtin padEnd
// @done


function __test_symbolic__(symbolic) {

  var r = symbolic.padEnd(5, '.');
  // @witness __test_symbolic__("abcde")
  __symbolic_assert__(r[r.length-1] === '.', false)

}

__test_symbolic__(__symbolic__('s', "abcd"));
