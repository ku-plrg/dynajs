// @type taint
// @target es6 Map.prototype.set
// @feature builtin set

function __test_taint__(tainted) {
    var m = new Map();
    m.set('k', tainted);

    // @witness m has only tainted value => whole map tainted
    __assert_taint__(m, true);

    var m2 = new Map();
    m2.set('a', tainted);
    m2.set('b', 'c');

    // @witness m2 has mixed values (tainted + clean) => false
    __assert_taint__(m2, false);
}

__test_taint__(__set_taint__('hello'));
