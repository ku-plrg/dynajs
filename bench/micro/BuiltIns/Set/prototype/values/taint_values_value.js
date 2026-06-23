// @type taint
// @target es6+ Set.prototype.values
// @feature builtin values

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);

    var arr = Array.from(s.values());

    // @witness tainted element survives values() iteration => tainted
    __assert_taint__(arr[0], true);

    var s2 = new Set();
    s2.add('clean');

    var arr2 = Array.from(s2.values());

    // @witness clean element through values() => clean
    __assert_taint__(arr2[0], false);
}

__test_taint__(__set_taint__('hello'));
