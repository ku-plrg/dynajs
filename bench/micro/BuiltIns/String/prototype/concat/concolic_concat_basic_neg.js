// @type concolic
// @target es5 String.prototype.concat
// @feature builtin concat
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __symbolic_assert__(symbolic.concat('Z') === 'abcZ', false);

}

__test_symbolic__(__symbolic__('s', "abc"));
