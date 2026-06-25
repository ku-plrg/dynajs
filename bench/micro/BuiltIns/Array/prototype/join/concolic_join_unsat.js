// @type concolic
// @target es5 Array.prototype.join
// @feature builtin join

function __test_symbolic__(symbolic) {
  if (symbolic.join(",").includes(",")) {
    // @witness join inserts a "," only between elements, so a present "," forces length >= 2
    __IS_SAT__(symbolic.length < 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
