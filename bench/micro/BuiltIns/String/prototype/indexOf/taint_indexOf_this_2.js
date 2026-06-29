// @type taint
// @target es5 String.prototype.indexOf
// @feature builtin indexOf
// @done

function __test_taint__(tainted) {
    var x0 = 'h';
    var x2 = 'i';
    var x = x0 + tainted + x2;

    // @witness not-found returns -1, a sentinel number
    __assert_taint__(x.indexOf('z'), false);
}

__test_taint__(__set_taint__('hello'));
