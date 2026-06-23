// @type taint
// @target es6+ tagged-template
// @feature syntax tagged-template

function __test_taint__(tainted) {
    function tt_first(strings) {
      return strings[0];
    }
    __assert_taint__(tt_first`onlyclean`, false);
}

__test_taint__(__set_taint__("x"));
