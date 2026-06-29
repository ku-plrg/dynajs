// @type taint
// @target es6+ tagged-template
// @feature syntax tagged-template
// @done

function tt_tag(strings, val) {
  return val;
}

function __test_taint__(tainted) {
    // @witness __test_taint__('x') => interpolated value = 'x' tainted, tt_tag returns val tainted
    __assert_taint__(tt_tag`pre${tainted}post`, true);
}

__test_taint__(__set_taint__("tv"));
