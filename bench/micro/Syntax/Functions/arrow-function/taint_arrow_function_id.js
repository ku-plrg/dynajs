// @type taint
// @target es6+ arrow-function
// @feature syntax arrow-function

function __test_taint__(tainted) {
    var id = (x) => x;
    __assert_taint__(id(tainted), true);
}

__test_taint__(__set_taint__("tv"));
