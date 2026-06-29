// @type taint
// @target es6+ arrow-function
// @feature syntax arrow-function
// @done

function __test_taint__(tainted) {
    var konst = (x) => "clean";
    // @witness always "clean"
    __assert_taint__(konst(tainted), false);
}

__test_taint__(__set_taint__("tv"));
