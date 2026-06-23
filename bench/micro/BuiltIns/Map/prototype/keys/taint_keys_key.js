// @type taint
// @target es6+ Map.prototype.keys
// @feature builtin keys

function __test_taint__(tainted) {
    var m = new Map();
    m.set(tainted, 'v');

    // @witness __test_taint__('hello') => [...m.keys()][0] = 'hello' tainted
    __assert_taint__([...m.keys()][0], true);

    var m2 = new Map();
    m2.set('cleanKey', 'v');

    // @witness always [...m2.keys()][0] = 'cleanKey', clean
    __assert_taint__([...m2.keys()][0], false);
}

__test_taint__(__set_taint__('hello'));
