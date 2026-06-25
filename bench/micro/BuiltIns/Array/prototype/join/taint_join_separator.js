// @type taint
// @target es6+ Array.prototype.join
// @feature builtin array-join

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.join(tainted);   // "ahellobhelloc"
    // @witness always r[0] = 'a', clean
    __assert_taint__(r[0], false);
    // @witness __test_taint__('x') => r[1] = 'x' tainted (first char of tainted separator)
    __assert_taint__(r[1], true);
    // @witness always r[6] = 'b', clean
    __assert_taint__(r[6], false);
    // @witness __test_taint__('x') => r[7] = 'x' tainted (separator repeats between elements)
    __assert_taint__(r[7], true);
    // @witness always r[12] = 'c', clean
    __assert_taint__(r[12], false);
}

__test_taint__(__set_taint__("hello"));
