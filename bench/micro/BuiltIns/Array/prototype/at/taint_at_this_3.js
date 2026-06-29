// @type taint
// @target es6+ Array.prototype.at
// @feature builtin array-at
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c"];
    // @witness clean element at index 2
    __assert_taint__(a.at(2), false);
}

__test_taint__(__set_taint__("hello"));
