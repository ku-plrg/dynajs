// @type taint
// @target es5 String.prototype.toLocaleUpperCase
// @feature builtin toLocaleUpperCase
// @done

function __test_taint__(tainted) {
    var x0 = 'a';
    var x2 = 'c';
    var x = x0 + tainted + x2;
    var r = x.toLocaleUpperCase();

    // @witness always r[0]='A'
    __assert_taint__(r[0], false);

    // @witness __test_taint__('x') => r[1]='X'
    __assert_taint__(r[1], true);

    // @witness always r[r.length-1]='C'
    __assert_taint__(r[r.length - 1], false);
}

__test_taint__(__set_taint__('hello'));
