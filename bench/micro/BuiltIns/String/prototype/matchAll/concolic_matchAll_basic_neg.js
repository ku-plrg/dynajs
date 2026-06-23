// @type concolic
// @target es6+ String.prototype.matchAll
// @feature builtin matchAll
// @done


function __test_symbolic__(symbolic) {


  // @witness __test_symbolic__("aa")
  __IS_SAT__([...symbolic.matchAll(/a/g)].length !== 1, true);

}

__test_symbolic__(__symbolic__('s', "abc"));
