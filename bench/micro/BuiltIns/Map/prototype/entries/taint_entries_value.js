// @type taint
// @target es6+ Map.prototype.entries
// @feature builtin entries

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);
    var e = [...m.entries()][0];

    // @witness e[1] is tainted value
    __assert_taint__(e[1], true);

    // @witness e[0] is clean key 'k'
    __assert_taint__(e[0], false);
}

__test_taint__(__set_taint__('hello'));
