// @type taint
// @target es6+ Object.setPrototypeOf
// @feature builtin setPrototypeOf

function __test_taint__(tainted) {
    // own tainted prop survives the prototype change (same object returned)
    var r = Object.setPrototypeOf({ p: tainted }, null);
    // @witness __test_taint__("hello") => r.p = "hello" tainted
    __assert_taint__(r.p, true);

    // tainted prop reached through the newly-set prototype
    var c = Object.setPrototypeOf({}, { q: tainted });
    // @witness __test_taint__("hello") => c.q = "hello" tainted (inherited)
    __assert_taint__(c.q, true);
}

__test_taint__(__set_taint__("hello"));
