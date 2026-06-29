// @type taint
// @target es6+ default-parameters
// @feature syntax default-parameters
// @done

function td_h(a = "clean") {
  return a;
}

function __test_taint__(tainted) {
    // @witness __test_taint__('x') => tainted arg overrides default, returned value = 'x' tainted
    __assert_taint__(td_h(tainted), true);
}

__test_taint__(__set_taint__("tv"));
