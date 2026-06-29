// @type taint
// @target es6+ Array.prototype.join
// @feature builtin array-join
// @done

function __test_taint__(tainted) {
    var a = ["a", tainted, "c"];
    var r = a.join(",");   // "a,hello,c"
    // @witness always r[r.length-1] = 'c', clean
    __assert_taint__(r[r.length-1], false);
}

__test_taint__(__set_taint__("hello"));
