// @type taint
// @target es6 Set.prototype.entries
// @feature builtin entries

function __test_taint__(tainted) {
    var s = new Set();
    s.add(tainted);

    var e = Array.from(s.entries())[0];

    // @witness Set entry is [v,v]; e[0] is tainted value => tainted
    __assert_taint__(e[0], true);

    // @witness e[1] is same tainted value => tainted
    __assert_taint__(e[1], true);

    var s2 = new Set();
    s2.add('clean');

    var e2 = Array.from(s2.entries())[0];

    // @witness clean element through entries() => clean
    __assert_taint__(e2[0], false);
}

__test_taint__(__set_taint__('hello'));
