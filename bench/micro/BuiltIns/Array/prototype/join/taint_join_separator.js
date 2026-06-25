// @type taint
// @target es6+ Array.prototype.join
// @feature builtin array-join
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.join(tainted);   // "ahellobhelloc"
    // @witness always r[0] = 'a', clean
    __assert_taint__(r[0], false);
    // @witness __test_taint__('x') => r[1] = 'x' tainted (first char of tainted separator)
    __assert_taint__(r[1], true);
    // @witness always r[r.length-1] = 'c', clean
    __assert_taint__(r[r.length-1], false);
}

__test_taint__(__set_taint__("hello"));
