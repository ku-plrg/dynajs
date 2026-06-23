// @type taint
// @target es6+ Map.prototype.clear
// @feature builtin clear

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);

    // @witness m.clear() = undefined, clean
    __assert_taint__(m.clear(), false);
}

__test_taint__(__set_taint__('hello'));
