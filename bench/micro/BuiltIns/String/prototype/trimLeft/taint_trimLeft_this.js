// @type taint
// @target es6+ String.prototype.trimLeft
// @feature builtin trimLeft
// @done

function __test_taint__(tainted) {
    var x0 = 'a';
    var x = '  ' + tainted + x0;
    var r = x.trimLeft();

    // @witness __test_taint__('x') => r[0]='x'
    __assert_taint__(r[0], true);

    // @witness always r[r.length-1]='a'
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('hello'));
