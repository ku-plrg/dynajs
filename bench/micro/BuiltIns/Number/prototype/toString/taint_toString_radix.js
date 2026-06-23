// @type taint
// @target es5 Number.prototype.toString
// @feature builtin toString

function __test_taint__(tainted) {
    var r = (255).toString(tainted);

    // @witness 16 clean; tainted is only the radix, output digits come from clean 255
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__(16));
