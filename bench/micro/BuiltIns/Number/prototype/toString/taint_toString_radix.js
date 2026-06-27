// @type taint
// @target es5 Number.prototype.toString
// @feature builtin toString

function __test_taint__(tainted) {
    var r = (255).toString(tainted);

    // @witness radix is only the base selector, not content => output digits clean
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__(16));
