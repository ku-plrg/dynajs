// @type taint
// @target es5 recursion
// @feature syntax recursion
// @done

function trc_echo(n, x) {
  return n <= 0 ? x : trc_echo(n - 1, x);
}

function __test_taint__(tainted) {
    // @witness __test_taint__('x') => trc_echo(2,'x') recurses to trc_echo(0,'x'), returns 'x' tainted
    __assert_taint__(trc_echo(2, tainted), true);
}

__test_taint__(__set_taint__("tv"));
