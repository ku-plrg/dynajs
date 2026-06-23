// @type concolic
// @target es5 String.prototype.blink
// @feature builtin blink
// @done


function __test_symbolic__(symbolic) {

  // @witness blink() always prepends '<blink>', so it begins with '<'
  __IS_SAT__(symbolic.blink()[0] !== '<', false);

}

__test_symbolic__(__symbolic__('s', "abc"));
