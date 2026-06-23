// @type concolic
// @target es5 Array.prototype.join
// @feature builtin join

function __test_symbolic__(symbolic) {
    var a = ["a", "b", "c"];
    var r = a.join(symbolic);
    if (r.length >= 3) {
        // @witness join keeps every concrete element, so literal "b" is always present
        __IS_SAT__(!(r.includes("b")), false);
    } else {
        __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', '-'));
