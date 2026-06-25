// @type concolic
// @target es5 Array.prototype.join
// @feature builtin join

function __test_symbolic__(symbolic) {
    var a = ["a", "b", "c"];
    // @witness __test_symbolic__("Z")
    __IS_SAT__(a.join(symbolic).includes("aZb"), true);
}

__test_symbolic__(__symbolic__('s', '-'));
