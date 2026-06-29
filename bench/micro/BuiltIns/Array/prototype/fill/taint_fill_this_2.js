// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c", "d"];
    a.fill("Z", 1, 3);  
    // @witness fill overwrites indices 1..2 with a clean value
    __assert_taint__(a[1], false);
}

__test_taint__(__set_taint__("hello"));
