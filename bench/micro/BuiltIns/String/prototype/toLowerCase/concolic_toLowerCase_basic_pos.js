// @type concolic
// @target es5 String.prototype.toLowerCase
// @feature builtin toLowerCase


function __test_symbolic__(symbolic) {

  // @witness toLowerCase never shortens a string, only expands
  __IS_SAT__(symbolic.toLowerCase().length < symbolic.length, false);

}

__test_symbolic__(__symbolic__('s', "ABC"));
