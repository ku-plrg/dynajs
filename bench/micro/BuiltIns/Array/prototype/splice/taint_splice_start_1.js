// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d"];
    var r = a.splice(tainted, 2);
    // @witness index/position, not content => clean
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__(1));
