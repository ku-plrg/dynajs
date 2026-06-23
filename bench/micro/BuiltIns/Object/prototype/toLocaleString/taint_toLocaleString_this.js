// @type taint
// @target es5 Object.prototype.toLocaleString
// @feature builtin toLocaleString

function __test_taint__(tainted) {
    var o = {p: tainted};
    var r = o.toLocaleString();
    // @witness always r='[object Object]'; delegates to toString; structural, no tainted content
    __assert_taint__(r, false);

    // @witness always r[0]='[' (structural bracket)
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__('hello'));
