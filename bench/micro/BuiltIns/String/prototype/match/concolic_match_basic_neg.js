// @type concolic
// @target es5 String.prototype.match
// @feature builtin match
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.match(/^a.c$/)) {
    // @witness __test_symbolic__("axc")
    __symbolic_assert__(symbolic[1] === 'b', false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
