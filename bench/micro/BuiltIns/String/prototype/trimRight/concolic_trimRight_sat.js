// @type concolic
// @target es5 String.prototype.trimRight
// @feature builtin trimRight
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.trimRight() === "  xyz  ", true);

}

__test_symbolic__(__symbolic__('s', "  abc  "));
