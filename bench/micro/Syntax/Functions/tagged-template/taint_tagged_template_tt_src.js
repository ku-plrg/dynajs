// @type taint
// @target es6+ tagged-template
// @feature syntax tagged-template

function tt_tag(strings, val) {
  return val;
}

function __test_taint__(tainted) {
    __assert_taint__(tt_tag`pre${tainted}post`, true);
}

__test_taint__(__set_taint__("tv"));
