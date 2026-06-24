// @type taint
// @target es6+ Array.fromAsync
// @feature builtin fromAsync

function __test_taint__(tainted) {
    // fromAsync resolves to a new array; the tainted source element flows into it
    Array.fromAsync([tainted]).then(function (r) {
        // @witness __test_taint__("a") => r[0] = "a" tainted
        __assert_taint__(r[0], true);
    });
}

__test_taint__(__set_taint__("a"));
