// @type taint
// @target es6+ Array.prototype.fill
// @feature builtin array-fill
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d"];
    var r = a.fill("Z", tainted, 3);
    // @witness tainted start index does not taint filled elements
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__(1));
