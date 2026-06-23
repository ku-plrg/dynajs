// @type taint
// @target es6+ default-parameters
// @feature syntax default-parameters

function td_h(a = "x") {
  return a;
}

function __test_taint__(tainted) {
    __assert_taint__(td_h(tainted), true);
}

__test_taint__(__set_taint__("tv"));
