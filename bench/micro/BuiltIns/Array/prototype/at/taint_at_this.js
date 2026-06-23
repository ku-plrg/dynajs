// @type taint
// @target es6+ Array.prototype.at
// @feature builtin array-at
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness ["x","b","c"].at(0) => "x" tainted
    __assert_taint__(a.at(0), true);
    // @witness clean element at index 1
    __assert_taint__(a.at(1), false);
    // @witness clean element at index 2
    __assert_taint__(a.at(2), false);
    // @witness negative index reaches tainted "x"
    __assert_taint__(a.at(-3), true);
    // @witness out-of-bounds index => undefined, clean
    __assert_taint__(a.at(99), false);
}

__test_taint__(__set_taint__("hello"));
