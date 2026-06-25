// @type concolic
// @target es6+ Object.assign
// @feature builtin assign

function __test_symbolic__(symbolic) {
  if (Object.assign({}, { x: symbolic }).x === 7) {
    // @witness assign copies x: symbolic into the target, so result.x === 7 forces symbolic to 7
    __IS_SAT__(symbolic !== 7, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 7));
