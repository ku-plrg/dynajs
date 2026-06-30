// @type concolic
// @target es5 String.prototype.concat
// @feature builtin concat
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("hi")
  __IS_SAT__(symbolic.concat('') === 'hi', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
