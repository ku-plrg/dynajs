// @type taint
// @target es6+ Set.prototype.keys
// @feature builtin keys

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);

    var arr = Array.from(s.keys());

    // @witness __test_taint__('hello') => arr[0] = 'hello' tainted
    __assert_taint__(arr[0], true);

    var s2 = new Set();
    s2.add('clean');

    var arr2 = Array.from(s2.keys());

    // @witness clean element through keys(), clean
    __assert_taint__(arr2[0], false);
}

__test_taint__(__set_taint__('hello'));
