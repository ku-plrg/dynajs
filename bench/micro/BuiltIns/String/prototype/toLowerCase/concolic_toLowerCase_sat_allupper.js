// @type concolic
// @target es5 String.prototype.toLowerCase
// @feature builtin toLowerCase
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("HI")
  __IS_SAT__(symbolic.toLowerCase() === 'hi' && symbolic === 'HI', true);

}

__test_symbolic__(__symbolic__('s', "hi"));
