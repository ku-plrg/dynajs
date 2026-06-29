// @type taint
// @target es5 String.prototype.toUpperCase
// @feature builtin toUpperCase
// @done

function __test_taint__(tainted) {
    var x0 = 'a';
    var x2 = 'c';
    var x = x0 + tainted + x2;
    var r = x.toUpperCase();

    // @witness always r[0]='A'
    __assert_taint__(r[0], false);
}

__test_taint__(__set_taint__('hello'));
