// @type concolic
// @target es6+ String.prototype.normalize
// @feature builtin normalize
// @done

function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("xyz")
  __IS_SAT__(symbolic.normalize() !== 'abc', true);

}

__test_symbolic__(__symbolic__('s', "abc"));
