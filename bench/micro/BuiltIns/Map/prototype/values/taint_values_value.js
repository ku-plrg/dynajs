// @type taint
// @target es6+ Map.prototype.values
// @feature builtin values
// @done

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);

    // @witness __test_taint__('x') => [...m.values()][0] = 'x' tainted
    __assert_taint__([...m.values()][0], true);
}

__test_taint__(__set_taint__('hello'));
