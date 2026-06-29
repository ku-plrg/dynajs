// @type taint
// @target es6+ Array.prototype.at
// @feature builtin array-at
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness ["x","b","c"].at(0) => "x" tainted
    __assert_taint__(a.at(0), true);
}

__test_taint__(__set_taint__("hello"));
