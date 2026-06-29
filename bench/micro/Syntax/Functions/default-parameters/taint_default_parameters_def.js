// @type taint
// @target es6+ default-parameters
// @feature syntax default-parameters
// @done

function td_g(a, b = "def") {
  return b;
}

function __test_taint__(tainted) {
    // @witness tainted passed as 'a', 'b' uses clean default "def" => clean
    __assert_taint__(td_g(tainted), false);
}

__test_taint__(__set_taint__("tv"));
