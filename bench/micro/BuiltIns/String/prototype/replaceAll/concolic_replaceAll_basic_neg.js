// @type concolic
// @target es6+ String.prototype.replaceAll
// @feature builtin replaceAll
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__("yyy")
  __IS_SAT__(symbolic.replaceAll('a', 'X') !== 'XXc', true);

}

__test_symbolic__(__symbolic__('s', "aac"));
