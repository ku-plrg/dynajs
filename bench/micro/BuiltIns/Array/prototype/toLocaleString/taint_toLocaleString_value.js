// @type taint
// @target es5 Array.prototype.toLocaleString
// @feature builtin array-toLocaleString

function __test_taint__(tainted) {
    var a = ["a", tainted, "c"];
    var r = a.toLocaleString();   // "a,k,c"
    // @witness always r[0] = 'a', clean
    __assert_taint__(r[0], false);
    // @witness r[1] = ',' separator inserted by toLocaleString, clean
    __assert_taint__(r[1], false);
    // @witness __test_taint__('k') => r[2] = 'k' tainted
    __assert_taint__(r[2], true);
}

__test_taint__(__set_taint__("k"));
