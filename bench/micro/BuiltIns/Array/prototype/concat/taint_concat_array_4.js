// @type taint
// @target es6+ Array.prototype.concat
// @feature builtin array-concat
// @done

function __test_taint__(tainted) {
    // tainted = whole-tainted array WITH elements (["a","b","c"])
    var r = tainted.concat(["d"]);
    // @witness always r[3] = "d" clean appended literal
    __assert_taint__(r[3], false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
