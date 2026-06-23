// @type concolic
// @target es5 String.prototype.blink
// @feature builtin blink


function __test_symbolic__(symbolic) {

  // @witness blink() always prepends '<blink>', so it begins at index 0
  __IS_SAT__(symbolic.blink().indexOf('<blink>') !== 0, false);

}

__test_symbolic__(__symbolic__('s', "abc"));
