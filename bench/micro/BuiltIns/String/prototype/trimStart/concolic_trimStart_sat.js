// @type concolic
// @target es6+ String.prototype.trimStart
// @feature builtin trimStart
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.trimStart() !== 'abc', true);

}

__test_symbolic__(__symbolic__('s', "  abc"));
