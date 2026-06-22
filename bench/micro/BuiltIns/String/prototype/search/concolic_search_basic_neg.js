// @type concolic
// @target es5 String.prototype.search
// @feature builtin search
// @done


function __test_symbolic__(symbolic) {

  if (symbolic.search(/b/) >= 0) {
    // @witness __test_symbolic__("bbb")
    __symbolic_assert__(symbolic.search(/b/) === 1, false);
  }

}

__test_symbolic__(__symbolic__('s', "abc"));
