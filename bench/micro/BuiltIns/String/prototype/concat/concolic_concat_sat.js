// @type concolic
// @target es5 String.prototype.concat
// @feature builtin concat
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.concat('Z') !== 'abcZ', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
