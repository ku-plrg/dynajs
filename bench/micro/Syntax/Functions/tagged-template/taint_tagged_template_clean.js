// @type taint
// @target es6+ tagged-template
// @feature syntax tagged-template
// @done

function __test_taint__(tainted) {
    function tt_first(strings) {
      return strings[0];
    }
    // @witness no interpolation, strings[0] = "onlyclean" literal => clean
    __assert_taint__(tt_first`onlyclean`, false);
}

__test_taint__(__set_taint__("x"));
