// @type taint
// @target es5 Object.prototype.toString
// @feature builtin toString

function __test_taint__(tainted) {
    var o = {p: tainted};
    var r = o.toString();
    // @witness always r='[object Object]'; structural string, no content from tainted prop
    __assert_taint__(r, false);

    // @witness always r[0]='[' (structural bracket)
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__('hello'));
