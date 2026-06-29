// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill
// @done

function __test_taint__(tainted) {
    var a = [tainted, "b", "c", "d"];
    a.fill("Z", 1, 3);  
    // @witness __test_taint__('x') => a[0] = 'x' tainted
    __assert_taint__(a[0], true);
}

__test_taint__(__set_taint__("hello"));
