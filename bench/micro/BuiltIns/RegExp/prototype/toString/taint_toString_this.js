// @type taint
// @target es5 RegExp.prototype.toString
// @feature builtin toString

function __test_taint__(tainted) {
    // literal pattern: /b/.toString() = "/b/" — all structural, not tainted data
    var r = /b/.toString();

    // @witness always r[0]='/' (structural delimiter)
    __assert_taint__(r[0], false);

    // @witness always r[1]='b' (from literal pattern, not tainted)
    __assert_taint__(r[1], false);

    // @witness always r[2]='/' (structural delimiter)
    __assert_taint__(r[2], false);
}

__test_taint__(__set_taint__('hello'));
