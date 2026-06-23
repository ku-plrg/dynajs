// @type taint
// @target es6+ Array.prototype.splice
// @feature builtin array-splice

function __test_taint__(tainted) {
    var a = ["a", "b", "c", "d"];
    var r = a.splice(1, tainted);
    // @witness tainted deleteCount does not taint removed elements
    __assert_taint__(r[0], false);
    __assert_taint__(r[1], false);
}

__test_taint__(__set_taint__(2));
