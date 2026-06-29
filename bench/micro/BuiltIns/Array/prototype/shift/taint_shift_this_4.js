// @type taint
// @target es5 Array.prototype.shift
// @feature builtin array-shift
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    var empty = [];
    // @witness a.shift() on empty array = undefined (OOB), clean
    __assert_taint__(empty.shift(), false);
}

__test_taint__(__set_taint__("hello"));
