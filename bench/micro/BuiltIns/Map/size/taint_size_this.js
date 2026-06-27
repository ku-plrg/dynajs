// @type taint
// @target es6+ Map.size
// @feature builtin size

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);

    // @witness __test_taint__('x') => m.size = 1 tainted
    __assert_taint__(m.size, true);
}

__test_taint__(__set_taint__('hello'));
