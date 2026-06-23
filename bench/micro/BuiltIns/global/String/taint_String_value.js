// @type taint
// @target es5 String
// @feature builtin String

function __test_taint__(tainted) {
    // String(tainted) where tainted is a string: content chars flow through
    var r = String(tainted);

    // @witness __test_taint__('ab') => r[0]='a' (tainted content)
    __assert_taint__(r[0], true);

    // @witness __test_taint__('ab') => r[1]='b' (tainted content)
    __assert_taint__(r[1], true);

    // String(taintedObj) => "[object Object]" structural; taint does not flow
    var obj = {};
    __set_taint__(obj);
    var s2 = String(obj);

    // @witness String({}) => "[object Object]" structural, not content
    __assert_taint__(s2, false);
}

__test_taint__(__set_taint__('ab'));
