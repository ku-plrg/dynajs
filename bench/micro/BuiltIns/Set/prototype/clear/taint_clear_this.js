// @type taint
// @target es6+ Set.prototype.clear
// @feature builtin clear

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);

    // @witness clear() returns undefined, clean
    __assert_taint__(s.clear(), false);
}

__test_taint__(__set_taint__('hello'));
