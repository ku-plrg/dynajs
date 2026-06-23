// @type taint
// @target es6+ Array.prototype.copyWithin
// @feature builtin array-copyWithin
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d"];
    var r = a.copyWithin(0, tainted);
    // @witness tainted start index does not taint copied elements
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__(2));
