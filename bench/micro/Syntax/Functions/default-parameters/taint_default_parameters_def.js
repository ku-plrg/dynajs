// @type taint
// @target es6+ default-parameters
// @feature syntax default-parameters

function td_g(a, b = "def") {
  return b;
}

function __test_taint__(tainted) {
    __assert_taint__(td_g(tainted), false);
}

__test_taint__(__set_taint__("tv"));
