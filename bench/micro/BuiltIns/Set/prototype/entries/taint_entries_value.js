// @type taint
// @target es6+ Set.prototype.entries
// @feature builtin entries

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);

    var e = Array.from(s.entries())[0];

    // @witness __test_taint__('hello') => e[0] = 'hello' tainted
    __assert_taint__(e[0], true);

    // @witness __test_taint__('hello') => e[1] = 'hello' tainted
    __assert_taint__(e[1], true);

    var s2 = new Set();
    s2.add('clean');

    var e2 = Array.from(s2.entries())[0];

    // @witness clean element through entries(), clean
    __assert_taint__(e2[0], false);
}

__test_taint__(__set_taint__('hello'));
