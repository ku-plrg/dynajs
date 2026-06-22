// @type concolic
// @target es6+ String.prototype.matchAll
// @feature builtin matchAll
// @done


function __test_symbolic__(symbolic) {


  // @witness __test_symbolic__("aa")
  __symbolic_assert__([...symbolic.matchAll(/a/g)].length === 1, false);

}

__test_symbolic__(__symbolic__('s', "abc"));
