// @type taint
// @target es6+ rest-spread
// @feature syntax rest-spread
// @done

function tr_first(...args) {
  return args[0];
}

function __test_taint__(tainted) {
    // @witness __test_taint__('x') => rest args[0] = 'x' tainted
    __assert_taint__(tr_first(tainted, "y"), true);
}

__test_taint__(__set_taint__("tv"));
