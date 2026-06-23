// @type taint
// @target es6 Set.prototype.add
// @feature builtin add

function __test_taint__(tainted) {
    var s1 = new Set();
    s1.add(tainted);

    // @witness tainted is sole member => whole set tainted
    __assert_taint__(s1, true);

    var s2 = new Set();
    s2.add(tainted);
    s2.add('c');

    // @witness mixed members => set container not fully tainted
    __assert_taint__(s2, false);
}

__test_taint__(__set_taint__('hello'));
