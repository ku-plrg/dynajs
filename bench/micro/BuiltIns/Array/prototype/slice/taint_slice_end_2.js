// @type taint
// @target es6+ Array.prototype.slice
// @feature builtin array-slice
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d"];
    var r = a.slice(1, tainted); 
    // @witness r[1] = "c" clean; tainted is only the end index
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__(3));
