// @type concolic
// @target es6+ String.prototype.symbol_iterator
// @feature builtin symbol_iterator


function __test_symbolic__(symbolic) {

  // @witness spreading a string into [...] always yields an array
  __IS_SAT__(!(Array.isArray([...symbolic])), false);

}

__test_symbolic__(__symbolic__('s', "abc"));
