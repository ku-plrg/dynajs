// @type taint
// @target es6+ Set.prototype.add
// @feature builtin add
// @done

function __test_taint__(tainted) {
    var s1 = new Set();
    s1.add(tainted);

    // @witness __test_taint__('hello') => s1 = Set{'hello'} tainted
    __assert_taint__(s1, true);

    var s2 = new Set();
    s2.add(tainted);
    s2.add('c');

    // @witness mixed (tainted + clean) => not all-tainted, clean
    __assert_taint__(s2, false);
}

__test_taint__(__set_taint__('hello'));
