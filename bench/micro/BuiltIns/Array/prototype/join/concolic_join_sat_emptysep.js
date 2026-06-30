// @type concolic
// @target es5 Array.prototype.join
// @feature builtin join
// @done


function __test_symbolic__(symbolic) {

  // @witness __test_symbolic__(["a","b"])
  __IS_SAT__(symbolic.join("") === "ab", true);

}

__test_symbolic__(__symbolic__('s', ["a"]));
