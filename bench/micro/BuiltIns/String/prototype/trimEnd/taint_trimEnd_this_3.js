// @type taint
// @target es6+ String.prototype.trimEnd
// @feature builtin trimEnd
// @done

function __test_taint__(tainted) {
    var x0 = 'a';
    var x2 = 'c';
    var x = x0 + tainted + x2 + '  ';
    var r = x.trimEnd();

    // @witness always r[r.length-1]='c'
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('hello'));
