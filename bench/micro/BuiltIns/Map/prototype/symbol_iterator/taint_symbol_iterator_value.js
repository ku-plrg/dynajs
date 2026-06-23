// @type taint
// @target es6+ Map.prototype[Symbol.iterator]
// @feature builtin symbol_iterator

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);
    var e = [...m][0];

    // @witness __test_taint__('hello') => e[1] = 'hello' tainted
    __assert_taint__(e[1], true);
}

__test_taint__(__set_taint__('hello'));
