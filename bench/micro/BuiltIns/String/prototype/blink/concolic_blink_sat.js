// @type concolic
// @target es5 String.prototype.blink
// @feature builtin blink
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.blink() !== '<blink>abc</blink>', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
