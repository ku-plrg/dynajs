// @type concolic
// @target es6+ String.prototype.trimEnd
// @feature builtin trimEnd
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.trimEnd() !== 'abc', true);

}

__test_symbolic__(__symbolic__('s', "abc  "));
