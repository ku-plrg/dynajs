// @type taint
// @target es6+ Array.prototype.join
// @feature builtin array-join
// @done

function __test_taint__(tainted) {
    var a = ["a", tainted, "c"];
    var r = a.join(",");   // "a,hello,c"
    // @witness r[1] = ',' separator inserted by join, clean
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__("hello"));
