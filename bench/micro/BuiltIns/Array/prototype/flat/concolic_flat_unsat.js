// @type concolic
// @target es6+ Array.prototype.flat
// @feature builtin flat
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.flat().length >= 1) {
    // @witness flat() draws its elements from the source, so a non-empty result forces source length >= 1
    __IS_SAT__(symbolic.length < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
