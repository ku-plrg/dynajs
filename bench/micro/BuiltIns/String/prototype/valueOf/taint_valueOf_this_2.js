// @type taint
// @target es5 String.prototype.valueOf
// @feature builtin valueOf
// @done

function __test_taint__(tainted) {
    var x0 = 'f';
    var x2 = 'o';
    var x = x0 + tainted + x2;
    var r = x.valueOf();

    // @witness __test_taint__('x') => r[1]='x' (tainted char)
    __assert_taint__(r[1], true);
}

__test_taint__(__set_taint__('hello'));
