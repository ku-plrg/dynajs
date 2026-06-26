// @type taint
// @target es6+ Map.prototype.entries
// @feature builtin entries
// @done

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);
    var e = [...m.entries()][0];

    // @witness __test_taint__('x') => e[1] = 'x' tainted
    __assert_taint__(e[1], true);

    // @witness e[0] = 'k' clean key, clean
    __assert_taint__(e[0], false);
}

__test_taint__(__set_taint__('hello'));
