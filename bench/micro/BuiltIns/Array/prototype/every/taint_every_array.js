// @type taint
// @target es6+ Array.prototype.every
// @feature builtin array-every
// @done

function __test_taint__(tainted) {
    // @witness always tainted.every(v => typeof v === "string") returns boolean, clean
    __assert_taint__(tainted.every(function(v) { return typeof v === "string"; }), false);
}

__test_taint__(__set_taint__(["a", "b", "c"]));
