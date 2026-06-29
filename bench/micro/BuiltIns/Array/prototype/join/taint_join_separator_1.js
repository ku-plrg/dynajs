// @type taint
// @target es6+ Array.prototype.join
// @feature builtin array-join
// @done

function __test_taint__(tainted) {
    var a = ["a", "b", "c"];
    var r = a.join(tainted);   // "ahellobhelloc"
    // @witness always r[0] = 'a', clean
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__("hello"));
