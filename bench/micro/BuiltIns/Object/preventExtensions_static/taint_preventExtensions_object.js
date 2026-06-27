// @type taint
// @target es5 Object.preventExtensions
// @feature builtin preventExtensions

function __test_taint__(tainted) {
    // preventExtensions returns the same object; tainted prop survives
    var r = Object.preventExtensions({ p: tainted });
    // @witness __test_taint__("x") => r.p = "x" tainted
    __assert_taint__(r.p, true);

    var r2 = Object.preventExtensions({ p: tainted, q: "clean" });
    // @witness mixed (tainted + clean) => not all-tainted, clean
    __assert_taint__(r2, false);
}

__test_taint__(__set_taint__("hello"));
